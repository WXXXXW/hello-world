const EventEmitter = require("events");
const checkdocDao = require('./dao/checkdocDao');
const scheduleDao = require("./dao/scheduleDao");
const dbutil = require("./dao/dbutil");
const logDispatcher = require("./libs/myLog").logDispatcher;


/**
 * 2019-1-23 22:43 by chtao
 * 分发类
 * 事件：
 *  finish 当前一个分发操作周期完成是触发
 *  nodata 没有取的分发数据时触发
 *  error 分发过程中出现错误时触发
 *
 *  开发者可根据这几个事件，自行控制分发流程
 *
 *  注意：
 *      应当注册 error 事件，以防止程序异常，导致 node 终止运行。
 *  函数功能：
 *  从 0 号机上取的 queryNum条数据，若 0 号机上没有数据，则触发 nodata 事件。
 *  将取的的数据轮训给爬虫服务器，一个轮训完成是触发 finish 事件。
 *  整个过程中出现错误时触发 error 事件。
 */
class Distribute extends EventEmitter {
    constructor(mode, rotateTime) {
        super();
        this.rotateTime = rotateTime;
        this.mode = mode;

        this.sendServer = global['schedule'][`${mode}Config`]["product_machine"];//做计算任务的服务器集合
        this.queryNum = global['schedule'][`${mode}Config`]["query_num"];

        // 根据权重算出来的总爬虫服务器，不一定等于后台服务器的数量
        this.num = this.sendServer.length;
        this.count = this.num;
    }
    /**
     * 将数据保存到生产机的数据库上
     * @param rowDataArr {array} 本地数据库 __表对应的记录集合
     * @param priority 当前发送的等级
     */
    async sendData(rowDataArr) {
        try {
            await Promise.all(rowDataArr.map(async rowData => {
                // 选择一台爬虫服务器
                let server = this.sendServer[this.count % this.num];
                // 选择下一台
                this.count += 1;
                // 防止为空值
                //rowData.papertype = rowData.papertype || 1;
                /*
                //新增最大字符数限制
                let length = rowData.content.length;
                let max_limit = 150000;
                if (length >= max_limit)
                    rowData.content = rowData.content.substring(0, max_limit); //最多处理max_limit字符数
                */
                // 生产机 积压的数量
                let count = await scheduleDao.insertAble(server, global["schedule"][`${this.mode}Config`]["DONE_F"],this.mode);
                if (count >= server.num_able) {
                    //logDispatcher.info("hostid (", server.hostid, ")", "count (", count, ") >= free num (", server.num_able, ") reject");
                    //logDispatcher.info(this.mode, "- reject, hostid (", server.hostid, ")", "nov count (", count, ") ");
                    return;
                }
                //logDispatcher.info("hostid (", server.hostid, ") speed=", rowData.speed, "count (", count, ") is ok, now to distribute",this.mode);

                await scheduleDao.insertDB(server, Object.values(rowData),this.mode);

                //await checkdocDao.updateStateAndNum(this.mode, [global['schedule'][`${this.mode}Config`]["ACCESS_F"], server.hostid, rowData["checknumber"]]);
                await checkdocDao.updateStateAndNum(this.mode, [global['schedule'][`${this.mode}Config`]["ACCESS_F"],server["hostid"] , rowData["SHOULI"]]);
                // 记录到日志中
                //logDispatcher.info(this.mode,`${rowData["checknumber"]}(${rowData["title"]}) start to ${server.hostname}(${server.hostid})`);
                //logDispatcher.info(this.mode, "- ${rowData['id']} start to (${server.hostid})");
            }));
            //let time = new Date() - global['schedule'][`${this.mode}Config`]['redistribute_expire'] * 1000 * 60;
            //time = new Date(time);
            //await checkdocDao.updateState11ByTimeout(this.mode, time)
        } catch (error) {
            //logDispatcher.info(this.mode, '- sendData err err err err err err err'); //yxp 报告一下
            this.emit('error', error);
        }
        // 即使有个别的失败，但一个轮训操作已完成
        //logDispatcher.info(this.mode, '- sendData finish -'); //yxp 报告一下
        this.emit('finish');
    }

    // 调度分发
    start() {
        checkdocDao.getByState(this.mode, [global['schedule'][`${this.mode}Config`]["SUBMIT_F"], this.queryNum], (err, rowDataArr) => {
            if (err) {
                logDispatcher.info(this.mode, '- sendData err err err err err err err'); //yxp 报告一下

                this.emit('error', err);
            } else if (rowDataArr.length > 0) { //改造by yxp，如果没有数据，就直接finish了。

                logDispatcher.info(this.mode, "- sendData of length: ", rowDataArr.length, "-");
                this.sendData(rowDataArr);
                // 即使有个别的失败，但一个轮训操作已完成

            } else {

                logDispatcher.info(this.mode, "- sendData is null -");
                this.emit('null');
                //this.sendData(rowDataArr);
            }
        });
    }
}

module.exports = Distribute;
