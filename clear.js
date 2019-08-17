const EventEmitter = require("events");
const checkdocDao = require('./dao/checkdocDao');
const scheduleDao = require("./dao/scheduleDao");
const dbutil = require("./dao/dbutil");
const {log, logClear} = require("./libs/myLog");
const fs = require("fs");

// 清理类
class Clear extends EventEmitter {
    constructor(mode) {
        super();
        this.mode=mode;
        this.proMachine = global['schedule'][`${this.mode}Config`]["product_machine"];
    }
    // 清理生产机数据库
    clearProductDB() {
        let time = new Date() - global['schedule'][`${this.mode}Config`]['product_data_expire'] * 1000 * 3600 ;
        time = new Date(time);

        this.proMachine.forEach(server => {
            scheduleDao.deleteByExpire(server,[time,global['schedule'][`${this.mode}Config`]["DONE_F"]],this.mode)
                .then(() => {
                    logClear.info(`成功清除${server.hostid} 生产机数据库`);
                })
                .catch(err => {
                    log.error(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid);
                });
        });
    }
}

module.exports = Clear;
