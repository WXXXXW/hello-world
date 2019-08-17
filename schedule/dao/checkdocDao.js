const dbutil = require('./dbutil');
const log = require("../libs/myLog").log;
const logDispatcher = require("../libs/myLog").logDispatcher;

function getByState(mode, fields, f) {
    let sql_1="select id, DocId, Path, Hash, ImgState, UpdateTime from db_image where ImgState=? order by id desc limit ?"
    let sql_2="select SHOULI, PIZHUN, XKDM, XKDM2, YJNX, YJSX, SBXKDM, SBXKDM2, YEAR, TITLE, KEYWORD, ABSTRACT, AUTHOR, COMPANY,"+
        "CATEGORY,NEED,SGTIKY,STATE,SGNEED,MINVALUE,SGLXYJ,SGYJNR,SGYJFA,SGTSCX,SGABSTARCT,IMAGE,SGIMAGE,REF,REPORT,EVINUM from y19_checkdoc"+
        " where STATE=? order by SHOULI desc limit ?"
    let sql_3="select SHOULI, PIZHUN, YEAR, TITLE, AUTHOR, COMPANY, CATEGORY, REF, CHECKTIME from y_checkdoc where STATE=? order by SHOULI desc limit ?"

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    conn.connect(function(err){
        if(err){
            console.log(`云rds_mysql连接失败: ${err}!`);
        }else{
            //console.log("云rds_mysql连接成功!");
        }
    });
    conn.query(sql_3, fields, (err, data) => {
        if (err)
            f(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode, null);
        else
            f(null, data);
    });
    conn.end();
}

function updateAll(mode, arr) {
    //console.log(arr);
    let sql_1="update db_image set ImgState=?,DocId=?, Path=?, Hash=?, UpdateTime=? where id=?"
    let sql_2="update y19_checkdoc set STATE=?, PIZHUN=?, XKDM=?, XKDM2=?, YJNX=?, YJSX=?, SBXKDM=?, SBXKDM2=?, YEAR=?, TITLE=?, KEYWORD=?, ABSTRACT=?, AUTHOR=?, COMPANY=?,"+
        "CATEGORY=?,NEED=?,SGTIKY=?,SGNEED=?,MINVALUE=?,SGLXYJ=?,SGYJNR=?,SGYJFA=?,SGTSCX=?,SGABSTARCT=?,IMAGE=?,SGIMAGE=?,REF=?,REPORT=?,EVINUM=? where SHOULI=?"
    let sql_3="update y_checkdoc set STATE=?,REPORT=?,EVINUM=? ,FINISHTIME=? where SHOULI=?"

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect(function(err){
            if(err){
                console.log(`云rds_mysql连接失败: ${err}!`);
            }else{
                //console.log("云rds_mysql连接成功!");
            }
        });
        conn.query(sql_3, arr, err => {
            if (err) {
                reject();
                log.error(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else
                //console.log("更新云rds成功！")
                resolve();
        });
        conn.end();
    });
}

function updateStateAndNum(mode, values) {

    //finishtime = NOW()，发送出去了，记录一下finishtime的时间
    let sql_1="update db_image set ImgState=? where id=?";
    let sql_2="update y19_checkdoc set STATE=? where SHOULI=?"
    let sql_3="update y_checkdoc set STATE=?,SERNUM=? where SHOULI=?"

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql_3, values, err => {
            if (err) {
                reject();
                log.error(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else
                resolve();
        });
        conn.end();
    });
}

//by yxp , 如果过期xx分钟，还是14的话，这里用finishtime来看时间差，因为finishtime是发送生产机的时间，说明生产机出了问题，检测不出来了，则重新置为11，重新发新的生产机进行计算
// 这个函数跟着distribute做吧，就不开另外的调度了。

function updateState11ByTimeout(mode, field) {

    let sql = "update checkdoc set state = 11, finishtime = NOW(), servernum='redistribute' " +
        "where state=14 and unix_timestamp(finishtime) < unix_timestamp(?) ";

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, field, err => {
            if (err) {
                reject();
                logDispatcher.info(mode,"-redistribute ERROR");
                log.error(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else {
                resolve();
                logDispatcher.info(mode,"- redistribute to 11 finished");
            }
        });
        conn.end();
    });
}


function deleteCheckdocByExpire(mode, field) {
    let sql = "delete from checkdoc where  unix_timestamp(checktime) < unix_timestamp(?)";

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, field, err => {
            if (err) {
                reject();
                log.error(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else
                resolve();
        });
        conn.end();
    });
}
//reduce 清理
function deleteReduceDocByExpire(mode, field) {
    let sql = "delete from reducedoc where  unix_timestamp(checktime) < unix_timestamp(?)";

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, field, err => {
            if (err) {
                reject();
                log.error(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else
                resolve();
        });
        conn.end();
    });
}

function queryDataByChecknumber(mode, num) {
    let sql_1="select Hash from db_image where id=?"
    let sql_2="select REF from y19_checkdoc where SHOULI=?"
    let sql_3="select REPORT from y_checkdoc where SHOULI=?"

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql_3, num, (err, data) => {
            if (err) {
                reject();
                log.error(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else
                //console.log(data);
                resolve(data);
        });
        conn.end();
    });
}

// 获得可在前端下载数据
function updateShow(mode, fields) {
    let sql = "update checkdoc set `show` = 1 where checktime > now() - interval ? minute " +
        "  and checktime <= now() - interval ? minute and `show` = 0 and state = 53 order by checktime asc limit ?";

    //let sql = "update checkdoc set `show` = 1 where timestampdiff(MINUTE, checktime, now()) <= ? " +
    //  "  and timestampdiff(MINUTE, checktime, now()) > ? and `show` = 0 and state = 53 order by checktime asc limit ?";

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, fields, err => {
            if (err) {
                reject(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else {
                resolve();
            }
        });
        conn.end();
    });
}

function getShowDataNum(mode, fields) {
    //
    let sql = "select count(*) as number from checkdoc where checktime > now() - interval ? minute  " +
        "and checktime <= now() - interval ? minute and `show` = 0 and state = 53;";

    //let sql = "select count(*) as number from checkdoc where  timestampdiff(MINUTE, checktime, now()) <= ? " +
    //  "and timestampdiff(MINUTE, checktime, now()) > ? and `show` = 0 and state = 53;";

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, fields, (err, arr) => {
            if (err) {
                reject(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else {
                resolve(arr[0].number);
            }
        });
        conn.end();
    });
}

function updateShowBySpeed(mode) {
    let sql = "update checkdoc set `show` = 1 where checktime > now() - interval 60 minute and speed >= 1 and `show` = 0 and state = 53";

    let conn = dbutil.createConn({
        hostname: global['schedule'][`${mode}Config`]["db_hostname"],
        db: global['schedule'][`${mode}Config`]["db_dbname"],
        user: global['schedule'][`${mode}Config`]["db_user"],
        password: global['schedule'][`${mode}Config`]["db_password"],
        port: global['schedule'][`${mode}Config`]["db_port"]
    });

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, err => {
            if (err) {
                reject(err.stack + "\n连接数据库：" + global['schedule'][`${mode}Config`]["db_hostname"], "版本： " + mode);
            } else {
                resolve();
            }
        });
        conn.end();
    });
}

module.exports = {
    getByState,
    updateStateAndNum,
    updateAll,
    deleteCheckdocByExpire,
    deleteReduceDocByExpire,
    queryDataByChecknumber,


    getShowDataNum,
    updateShow,
    updateShowBySpeed,

    //新增重算功能，by yxp
    updateState11ByTimeout
};