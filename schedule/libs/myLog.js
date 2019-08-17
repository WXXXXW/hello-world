let log4js = require('log4js');
let path = require("path");

let conf = {
    appenders: {
        log: {
            type: "dateFile",
            filename: path.join(__dirname, `../logs/lwcc`),
            alwaysIncludePattern: true,
            pattern: "_yyyy-MM-dd.log",
            encoding: 'utf-8'
        },
        logDispatcher: {
            type: "dateFile",
            filename: path.join(__dirname, `../logs/dispatcher`),
            alwaysIncludePattern: true,
            pattern: "_yyyy-MM-dd.log",
            encoding: 'utf-8'
        },
        logRecycle: {
            type: "dateFile",
            filename: path.join(__dirname, `../logs/recycle`),
            alwaysIncludePattern: true,
            pattern: "_yyyy-MM-dd.log",
            encoding: 'utf-8'
        },
        logClear: {
            type: "dateFile",
            filename: path.join(__dirname, `../logs/clear`),
            alwaysIncludePattern: true,
            pattern: "_yyyy-MM-dd.log",
            encoding: 'utf-8'
        },
        stdout: {
            type: 'stdout',
        },
    },
    categories: {
        default: {
            appenders: ['stdout'],
            level: 'all',
        },
        log: {
            appenders: ['log'],
            level: 'all'
        },
        logDispatcher: {
            appenders: ['logDispatcher'],
            level: 'all'
        },
        logClear: {
            appenders: ['logClear'],
            level: 'all'
        },
        logRecycle: {
            appenders: ['logRecycle'],
            level: 'all'
        },
        stdout: {
            appenders: ['stdout'],
            level: 'all'
        }
    }
};

log4js.configure(conf);

/*if (global['schedule'][`CSBConfig`].env === "development") {
    exports.log = log4js.getLogger("stdout");
} else {
    exports.log = log4js.getLogger("log");
}*/

exports.log = log4js.getLogger("log");
exports.logDispatcher = log4js.getLogger("logDispatcher");
exports.logRecycle = log4js.getLogger("logRecycle");
exports.logClear = log4js.getLogger("logClear");
