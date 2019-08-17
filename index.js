global["schedule"] = {};
global["schedule"]["REFConfig"] = require("./conf/RefConf");

const logDispatcher = require("./libs/myLog").logDispatcher;
const log = require("./libs/myLog").log;
const Distribute = require("./distribute");
//const Redistribute = require("./redistribute");  //新增重算功能，by yxp
const Recycle = require("./recycle");
const Clear = require("./clear");
//const Show = require("./show");
//const {ReduceRecycle, ReduceSend} = require("./reduce");
//const {RefRecycle, RefSend} = require("./reference");

// 执行 IP 代理服务
//require("./proxyIP");

function clear() {
    let refClear = new Clear("REF");
    // 清理任务
    refClear.on('error', err => {
        log.error(err);
    });
    // 清理生产机
    setInterval(refClear.clearProductDB.bind(refClear), global['schedule'][`REFConfig`]['product_data_interval']);
    refClear.clearProductDB();
}

/*function redistribute(){
    //x分钟轮询一次
    let csb_reDistribute = new Redistribute("CSB", 1000 * 60 * 10);
    let grb_reDistribute = new Redistribute("GRB", 1000 * 60 * 10);
    let jgb_reDistribute = new Redistribute("JGB", 1000 * 60 * 10);

    setInterval(csb_reDistribute.start.bind(csb_reDistribute), csb_reDistribute.rotateTime);
    setInterval(grb_reDistribute.start.bind(grb_reDistribute), grb_reDistribute.rotateTime);
    setInterval(jgb_reDistribute.start.bind(jgb_reDistribute), jgb_reDistribute.rotateTime);

    //先执行一次
    csb_reDistribute.start();
    grb_reDistribute.start();
    jgb_reDistribute.start();
}
*/
function distribute() {
    let refDistribute = new Distribute('REF', 1000 * 2);

    /////引文版//////
    refDistribute.on('finish', () => {
        setTimeout(refDistribute.start.bind(refDistribute), refDistribute.rotateTime);
        //logDispatcher.info('CSB', '- finish setTimeout success -');
    });
    //如果有err，仍继续，等待间隔设置为x秒
    refDistribute.on('error', err => {
        log.error(err);
        setTimeout(refDistribute.start.bind(refDistribute), 1000 * 20);
        logDispatcher.info('REF', '- error  setTimeout success -');
    });
    //如果send数据为空，仍继续，等待间隔设置为x秒
    refDistribute.on('null', () => {
        setTimeout(refDistribute.start.bind(refDistribute), 1000 * 15);
        //logDispatcher.info('CSB', '- null   setTimeout success -');
    });
/*
    /////个人版//////
    grbDistribute.on('finish', () => {
        setTimeout(grbDistribute.start.bind(grbDistribute), grbDistribute.rotateTime);
        //logDispatcher.info('GRB', '- finish setTimeout success -');
    });
    //如果有err，仍继续，等待间隔设置为x秒
    grbDistribute.on('error', err => {
        log.error(err);
        setTimeout(grbDistribute.start.bind(grbDistribute), 1000 * 20);
        logDispatcher.info('GRB', '- error  setTimeout success -');
    });
    //如果send数据为空，仍继续，等待间隔设置为x秒
    grbDistribute.on('null', () => {
        setTimeout(grbDistribute.start.bind(grbDistribute), 1000 * 15);
        //logDispatcher.info('GRB', '- null   setTimeout success -');
    });

    /////机构版//////
    jgbDistribute.on('finish', () => {
        setTimeout(jgbDistribute.start.bind(jgbDistribute), jgbDistribute.rotateTime);
        //logDispatcher.info('JGB', '- finish setTimeout success -');
    });
    //如果有err，仍继续，等待间隔设置为x秒
    jgbDistribute.on('error', err => {
        log.error(err);
        setTimeout(jgbDistribute.start.bind(jgbDistribute), 1000 * 20);
        logDispatcher.info('JGB', '- error  setTimeout success -');
    });
    //如果send数据为空，仍继续，等待间隔设置为x秒
    jgbDistribute.on('null', () => {
        setTimeout(jgbDistribute.start.bind(jgbDistribute), 1000 * 15);
        //logDispatcher.info('JGB', '- null   setTimeout success -');
    });
*/
    refDistribute.start();
    //grbDistribute.start();
    //jgbDistribute.start();
}

function recycle() {
    let refRecycle = new Recycle('REF', 1000 * 10);
    //let grbRecycle = new Recycle('GRB', 1000 * 10);
    //let jgbRecycle = new Recycle('JGB', 1000 * 10);

    // 引文版
    refRecycle.on('error', err => {
        log.error(err); //如果有err，也继续
        //setTimeout(csbRecycle.start.bind(csbRecycle), 1000 * 20);
    });
    refRecycle.on('nodata', server => {
        setTimeout(refRecycle.start.bind(refRecycle), 1000 * 15, server);
    });
    refRecycle.on('finish', server => {
        setTimeout(refRecycle.start.bind(refRecycle), refRecycle.rotateTime, server);
    });
    refRecycle.recycleServer.forEach(server => {
        refRecycle.start(server);
    });
/*
    // 个人版
    grbRecycle.on('error', err => {
        log.error(err);     //如果有err，也继续
        setTimeout(grbRecycle.start.bind(grbRecycle), 1000 * 20, server);
    });
    grbRecycle.on('nodata', server => {
        setTimeout(grbRecycle.start.bind(grbRecycle), 1000 * 15, server);
    });
    grbRecycle.on('finish', server => {
        setTimeout(grbRecycle.start.bind(grbRecycle), grbRecycle.rotateTime, server);
    });
    grbRecycle.recycleServer.forEach(server => {
        grbRecycle.start(server);

    });

    // 机构版
    jgbRecycle.on('error', err => {
        log.error(err); //如果有err，也继续
        setTimeout(jgbRecycle.start.bind(jgbRecycle), 1000 * 20, server);
    });
    jgbRecycle.on('nodata', server => {
        setTimeout(jgbRecycle.start.bind(jgbRecycle), 1000 * 15, server);
    });
    jgbRecycle.on('finish', server => {
        setTimeout(jgbRecycle.start.bind(jgbRecycle), jgbRecycle.rotateTime, server);
    });
    jgbRecycle.recycleServer.forEach(server => {
        jgbRecycle.start(server);
    });
*/
}
/*
function show() {
    let show = new Show("GRB", 1000 * 60);

    setInterval(show.start.bind(show), show.rotateTime);
    show.start();
}

// 降重
function reduce() {
    let reduceRecycle = new ReduceRecycle("GRB", 1000 * 15);
    let reduceSend = new ReduceSend("GRB", 1000 * 15);

    // 发送
    reduceSend.on("finish", () => {
        setTimeout(reduceSend.start.bind(reduceSend), reduceSend.rotateTime);
    });
    reduceSend.start();

    // 回收
    reduceRecycle.on("finish", server => {
        setTimeout(reduceRecycle.start.bind(reduceRecycle), reduceRecycle.rotateTime, server);
    });
    reduceRecycle.servers.forEach(server => {
        reduceRecycle.start(server);
    });
}

// 参考文献
function ref() {
    let refRecycle = new RefRecycle("GRB", 1000 * 30);
    let refSend = new RefSend("GRB", 1000 * 30);

    // 发送
    refSend.on("finish", () => {
        setTimeout(refSend.start.bind(refSend), refSend.rotateTime);
    });
    refSend.start();

    // 回收
    refRecycle.on("finish", server => {
        setTimeout(refRecycle.start.bind(refRecycle), refRecycle.rotateTime, server);
    });
    refRecycle.servers.forEach(server => {
        refRecycle.start(server);
    });
}
*/
function main() {
    distribute();
    recycle();
    //show();
    //clear();
    //reduce();
    //ref();
    //新增 redistribute
    //redistribute();
}

main();
