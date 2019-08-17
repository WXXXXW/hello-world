/**
 * 这个文件操作都是生产机上的数据库
 */
const dbutil = require('./dbutil');
const log = require("../libs/myLog").log;

function insertDB(server, fields,mode) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`${mode}Config`]["prod_db_dbname"],
        user: global['schedule'][`${mode}Config`]["prod_db_user"],
        password: global['schedule'][`${mode}Config`]["prod_db_password"],
        port: server["port"] || "3306"
    });
    let sql_1="insert into db_image(id, DocId, Path, Hash, ImgState, UpdateTime ) values (?,?,?,?,?,?)"
    let sql_2="insert into y19_checkdoc(SHOULI, PIZHUN, XKDM, XKDM2, YJNX, YJSX, SBXKDM, SBXKDM2, YEAR, TITLE, KEYWORD, ABSTRACT, AUTHOR, COMPANY,"+
        "CATEGORY,NEED,SGTIKY,STATE,SGNEED,MINVALUE,SGLXYJ,SGYJNR,SGYJFA,SGTSCX,SGABSTARCT,IMAGE,SGIMAGE,REF,REPORT,EVINUM) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    let sql_3="insert into y_checkdoc(uuid, SHOULI, PIZHUN, YEAR, TITLE, AUTHOR, COMPANY, CATEGORY, REF, CHECKTIME) values(REPLACE(UUID(),'-',''),?,?,?,?,?,?,?,?,?)"

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql_3, fields, err => {
            if (err) {
                log.error(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid);
                reject();
            } else
                resolve();
        });
        conn.end();
    });
}

function queryDB(server, state,mode, f) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`${mode}Config`]["prod_db_dbname"],
        user: global['schedule'][`${mode}Config`]["prod_db_user"],
        password: global['schedule'][`${mode}Config`]["prod_db_password"],
        port: server["port"] || "3306"
    });
    let sql_1="select id, DocId, Path, Hash, UpdateTime from db_image where ImgState=? limit 60"
    let sql_2="select SHOULI, PIZHUN, XKDM, XKDM2, YJNX, YJSX, SBXKDM, SBXKDM2, YEAR, TITLE, KEYWORD, ABSTRACT, AUTHOR, COMPANY,"+
        "CATEGORY,NEED,SGTIKY,SGNEED,MINVALUE,SGLXYJ,SGYJNR,SGYJFA,SGTSCX,SGABSTARCT,IMAGE,SGIMAGE,REF,REPORT,EVINUM from y19_checkdoc where STATE=? limit 60"
    let sql_3="select SHOULI,REPORT,EVINUM ,FINISHTIME from y_checkdoc where STATE=? limit 60"
    conn.connect();
    conn.query(sql_3, state, (err, data) => {
        if (err) {
            log.error(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid);
            f(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid, null);
        } else
            f(null, data);
    });
    conn.end();
}

function updateState(server, arr,mode) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`${mode}Config`]["prod_db_dbname"],
        user: global['schedule'][`${mode}Config`]["prod_db_user"],
        password: global['schedule'][`${mode}Config`]["prod_db_password"],
        port: server["port"] || "3306"
    });
    let sql_1="update db_image set ImgState=? where id=?"
    let sql_2="update y19_checkdoc set STATE=? where SHOULI=?"
    let sql_3="update y_checkdoc set STATE=? where SHOULI=?"

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql_3, arr, err => {
            if (err) {
                log.error(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid);
                reject();
            } else
                resolve();
        });
        conn.end();
    });
}

async function deleteByExpire(server, expire,mode) {
    let sqlArr = [];
    //sql_1="delete from db_image where ImgState=? limit 60";
    sql_2="delete from db_image where unix_timestamp(UpdateTime) < unix_timestamp(?) And Imgstate=?";
    sql_3="delete from y_checkdoc where unix_timestamp(FINISHTIME) < unix_timestamp(?) And STATE=?"
    sqlArr.push(sql_3);
    await Promise.all(sqlArr.map(sql => {
        let conn = dbutil.createConn({
            hostname: server["hostname"],
            db: global['schedule'][`${mode}Config`]["prod_db_dbname"],
            user: global['schedule'][`${mode}Config`]["prod_db_user"],
            password: global['schedule'][`${mode}Config`]["prod_db_password"],
            port: server["port"] || "3306"
        });
        return new Promise((resolve, reject) => {
            conn.connect();
            conn.query(sql_3, expire, err => {
                if (err) {
                    log.error(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid);
                    reject();
                } else
                    resolve();
            });
            conn.end();
        });
    }));
}
//判断能否插入数据
function insertAble(server, state,mode) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`${mode}Config`]["prod_db_dbname"],
        user: global['schedule'][`${mode}Config`]["prod_db_user"],
        password: global['schedule'][`${mode}Config`]["prod_db_password"],
        port: server["port"] || "3306"
    });
    let sql_1 = "select count(*) as count from db_image where ImgState <> ?";
    let sql_2 = "select count(*) as count from y19_checkdoc where STATE <> ?";
    let sql_3 = "select count(*) as count from y_checkdoc where STATE <> ?"

    return new Promise((resolve, reject) => {
        conn.connect(function(err){
            if(err){
                console.log(`生产机mysql连接失败: ${err}!`);
            }else{
                //console.log("生产机mysql连接成功!");
            }
        });
        conn.query(sql_3, state, (err, arr) => {
            if (err) {
                log.error(err.stack + "\n数据库：" + server.hostname + " 编号： " + server.hostid);
                reject();
            } else
                //console.log(arr&&arr[0].count);
                resolve(arr && arr[0].count);
        });
        conn.end();
    });
}

/**
 *  设置 reducedoc 表中的数据
 * @param server
 * @param fields
 */
function insertData(server, fields) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`GRBConfig`]["prod_db_dbname"],
        user: global['schedule'][`GRBConfig`]["prod_db_user"],
        password: global['schedule'][`GRBConfig`]["prod_db_password"],
        port: server["port"] || "3306"
    });
    let sql = "insert into reducedoc(checknumber, username, dzPath, reducePath, state, title)" +
        "values(?, ?, ?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, fields, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
        conn.end();
    });
}

function getData(server) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`GRBConfig`]["prod_db_dbname"],
        user: global['schedule'][`GRBConfig`]["prod_db_user"],
        password: global['schedule'][`GRBConfig`]["prod_db_password"],
        port: server["port"] || "3306"
    });

    let sql = "select * from reducedoc where state = 3 limit 30";

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, (err, arr) => {
            if (err)
                reject(err);
            else
                resolve(arr);
        });
        conn.end();
    });
}

function updateStateByReduce(server, num) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`GRBConfig`]["prod_db_dbname"],
        user: global['schedule'][`GRBConfig`]["prod_db_user"],
        password: global['schedule'][`GRBConfig`]["prod_db_password"],
        port: server["port"] || "3306"
    });

    let sql = "update reducedoc set state = 5 where checknumber = ?";

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, num, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
        conn.end();
    });
}

// 参考文献
function insertDataToRef(server, fields) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`GRBConfig`]["prod_db_dbname"],
        user: global['schedule'][`GRBConfig`]["prod_db_user"],
        password: global['schedule'][`GRBConfig`]["prod_db_password"],
        port: server["port"] || "3306"
    });
    let sql = "insert into refdoc(refnumber, title, username, input_content, state)" +
        "values(?, ?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, fields, err => {
            if (err) {
                log.error(err);
                reject(err);
            } else
                resolve();
        });
        conn.end();
    });
}

function getDataFromRef(server) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`GRBConfig`]["prod_db_dbname"],
        user: global['schedule'][`GRBConfig`]["prod_db_user"],
        password: global['schedule'][`GRBConfig`]["prod_db_password"],
        port: server["port"] || "3306"
    });

    let sql = "select * from refdoc where state = 3 limit 30";

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, (err, arr) => {
            if (err)
                reject(err);
            else
                resolve(arr);
        });
        conn.end();
    });
}

function updateStateByRef(server, num) {
    let conn = dbutil.createConn({
        hostname: server["hostname"],
        db: global['schedule'][`GRBConfig`]["prod_db_dbname"],
        user: global['schedule'][`GRBConfig`]["prod_db_user"],
        password: global['schedule'][`GRBConfig`]["prod_db_password"],
        port: server["port"] || "3306"
    });

    let sql = "update refdoc set state = 5 where refnumber = ?";

    return new Promise((resolve, reject) => {
        conn.connect();
        conn.query(sql, num, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
        conn.end();
    });
}


module.exports = {
    insertDB,
    updateState,
    queryDB,
    deleteByExpire,
    insertAble,

    // 降重读取数据
    insertData,
    getData,
    updateStateByReduce,

    // 参考文献
    insertDataToRef,
    getDataFromRef,
    updateStateByRef,
};
