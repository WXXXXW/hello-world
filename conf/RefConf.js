// 引文甄别调度配置
module.exports = {
    ...require("./baseConf"),
    /************ 分发参数配置 ************/
    // 一个轮训发送给生产机的数据�?
    query_num: 3,
    //这里列出的是做引文甄别任务所使用的生产机，都需要做下发任务，回收任务等�?
    product_machine: [
        //{hostid:'01_1', hostname: '10.1.217.208',port:'3306', num_able: 3,vip_num_able: 5},
        //{hostid:'01', hostname: 'naiss-no4host-local-mysql4-1',port:'3306', num_able: 3,vip_num_able: 5},
        //{hostid:'02', hostname: 'naiss-no5host-local-mysql5-1',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06', hostname: 'naiss-no6host-local-mysql6-1',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_1', hostname: 'naiss-no6hostnew-1',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_2', hostname: 'naiss-no6hostnew-2',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_3', hostname: 'naiss-no6hostnew-3',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_4', hostname: 'naiss-no6hostnew-4',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_5', hostname: 'naiss-no6hostnew-5',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_6', hostname: 'naiss-no6hostnew-6',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_7', hostname: 'naiss-no6hostnew-7',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_8', hostname: 'naiss-no6hostnew-8',port:'3306', num_able: 3,vip_num_able: 5},
        {hostid:'06_9', hostname: 'naiss-no6hostnew-9',port:'3306', num_able: 3,vip_num_able: 5},
    ],
    // ----------- 云rds数据库配�?----------------
    db_hostname: "mysql",
    //db_hostname:"localhost",
    db_dbname: "naiss",
    //db_dbname:"test",
    db_password: "Mysql@naiss",
    //db_password:"root",
    db_port: 3306,
    db_user: "root",
    // ------------生产机数据库-----------------
    prod_db_dbname: "naiss",
    //prod_db_dbname:"schedule",
    prod_db_user: "root",
    prod_db_password: "Mysql@naiss",
    //prod_db_password:"root"
};
