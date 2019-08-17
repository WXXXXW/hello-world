const EventEmitter = require("events");
const checkdocDao = require('./dao/checkdocDao');
const scheduleDao = require("./dao/scheduleDao");
const dbutil = require("./dao/dbutil");
const logRecycle = require("./libs/myLog").logRecycle;
const log = require("./libs/myLog").log;

// 回收类
class Recycle extends EventEmitter {
    constructor(mode, rotateTime) {
        super();
        this.mode = mode;

        this.rotateTime = rotateTime;
        this.recycleServer = global['schedule'][`${this.mode}Config`]["product_machine"];
    }
    getData(server, f) {
        scheduleDao.queryDB(server, global['schedule'][`${this.mode}Config`]["RECYCLE_F"], this.mode,(err, data) => {
            if (err) {
                this.emit("error", err);
                console.log(this.mode, '- recycle err, wait for 60s to restart recycle');
                //logRecycle.info(this.mode, '- recycle err, wait for 60s to restart recycle'); //yxp 报告一下
                this.emit('finish', server);
            } else {
                if (!data || data.length <= 0) {
                    this.emit('nodata', server);
                    //logRecycle.info(this.mode,'- recycle nodata, wait for 30s to restart recycle'); //yxp 报告一下
                    return;
                }

                f(data, server)
                    .then(() => {
                        this.emit('finish', server);
                    })
                    .catch(err => {
                        this.emit('error', err);
                        logRecycle.info(this.mode, '- recycle err err err err err'); //yxp 报告一下
                        //this.emit('finish', server);
                    })
            }
        });
    }

    // 回收资源，f用来回收数据
    start(server) {
        this.getData(server, async (data, server) => {
            await Promise.all(data.map(async item => {
                try {
                    let pathName = item.REPORT.split("D:\\Paper-T\\Files")[1];
                    pathName = pathName.replace(/\\/g, "/");

                    // 防止出现特殊字符
                    item.REPORT = encodeURI(global['schedule'][`${this.mode}Config`]["upload_server"] + pathName);
                } catch (e) {
                    // log.error(e);
                }

                let value = Object.values(item);
                await checkdocDao.updateAll(this.mode, [global['schedule'][`${this.mode}Config`]["FINISH_F"], ...value.slice(1), value[0]]);

                checkdocDao.queryDataByChecknumber(this.mode, item["SHOULI"])
                    .then(data => {
                        let s=data.length
                        if (!(data.length === 0)) {
                            scheduleDao.updateState(server, [global['schedule'][`${this.mode}Config`]["DONE_F"], item["SHOULI"]],this.mode)
                                .then(() => {
                                })
                                .catch(err => {
                                    log.error(err);
                                });

                            // 记录日志
                            logRecycle.info(this.mode, `- from ${server["hostid"]} recycle ${item["SHOULI"]}`);
                        }
                    })
                    .catch(err => {
                        log.error(err);
                    })
            }));
        });
    }
}

module.exports = Recycle;
