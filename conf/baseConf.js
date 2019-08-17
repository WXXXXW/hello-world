// 基础的全局配置，可被覆盖
module.exports = {
    // 共享盘报告路径
    share_report: '/data/lwcc_files',
    // 当生产机挤压的数量小于这个数时 才发送到生产机上
    num_able: 3,
    // vip
    vip_num_able: 4,

    /************ 数据库 state 标志 ************/
    // 用户上传后，rds
    SUBMIT_F: 11,
    // 发送给生产机之后，rds
    ACCESS_F: 14,
    // 从生产机回收时（碰到该state，就回收）生产机数据库
    RECYCLE_F: 12,
    // 回收之后修改生产机（用于清楚生产机的数据）生产机数据库
    DONE_F: 14,
    // 回收之后修改 WEB（碰到该state，就用其数据同步到前端）在rds中
    FINISH_F: 15,
    // 共享报告和 checkdoc 表的过期时间 单位(天)
    local_data_expire: 6,
    // 共享报告和 checkdoc 表清理间隔 单位(ms)
    local_data_interval: 1000 * 3600 * 24,
    // 生产机上报告(数据)过期时间 单位(小时)
    product_data_expire: 0.5,
    // 生产机上清理间隔
    product_data_interval: 1000 * 60 * 60,
    // 重算时间 单位分钟
    redistribute_expire: 20
};
