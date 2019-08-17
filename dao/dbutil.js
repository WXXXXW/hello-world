const mysql = require('mysql');

function createConn({
                        hostname = "localhost",
                        user = "root",
                        password = "Mysql@naiss",
                        db = "naiss",
                        port = "3306"
                    } = {}, multi = "false") {
    return mysql.createConnection({
        host: hostname,
        port,
        user,
        password,
        database: db,
        multipleStatements: multi,
    });
}

//4.18 by yxp 增加port:3306
function createConnPool({
                            hostname = "localhost",
                            user = "root",
                            password = "Mysql@naiss",
                            db = "naiss",
                            port = "3306", //新增
                        } = {}, multi = "false") {
    return mysql.createPool({
        host: hostname,
        //port: '3306',删除
        port,
        user,
        password,
        database: db,
        multipleStatements: multi,
    });
}

module.exports.createConn = createConn;
module.exports.createConnPool = createConnPool;
