//引入其他模块
const express = require('express');
const server = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const md5 = require('md5');
const mysql = require('mysql');
//创建连接池 
const pool = mysql.createPool({
    //MySQL数据库服务器的地址
    host: '62.234.42.153',
    //端口号
    port: 8306,
    //数据库用户的用户名
    user: 'zy',
    //数据库用户的密码
    password: 'by$kS!Bvb16MAF5O',
    //数据库名称
    database: 'gzms',
    //最大连接数据
    connectionLimit: 20
});

//解决跨域问题  不太确定是不是这么写
server.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080']
}));

//使用系统模块querystring来处理
server.use(bodyParser.urlencoded({
    extended: false
}));


server.listen(3000, () => {
    console.log('server is running...');
});

//订单列表接口by张玥
server.post('/orderList', (req, res) => {
    let title = '%' + req.body.title + '%';
    let role = parseInt(req.body.role);
    let uid = parseInt(req.body.uid);
    let page = parseInt(req.body.page);
    let pageSize = 5;
    let offset = (page - 1) * pageSize;
    if (role == 0) {
        let sql = "SELECT oid,r_title, old_town, r_photo, r_room, r_bed, r_people, order_time,all_price FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE go.`r_uid`=? AND  ghr.`r_title` LIKE ? LIMIT " + offset + ',' + pageSize;
        pool.query(sql, [uid, title], (error, results) => {
            if (error) throw error;
            ////////////////////////
            let sql = "SELECT COUNT(oid) AS count FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE go.`r_uid`=? AND ghr.`r_title` LIKE ? ";
            let rowcount;
            let pagecount;
            pool.query(sql, [uid, title], (err, result) => {
                if (err) throw err;
                rowcount = result[0].count;
                pagecount = Math.ceil(rowcount / pageSize);
                res.send({ message: '查询成功', code: 1, results, pagecount });
            })
        });
    } else {
        let sql = "SELECT oid,r_title, old_town, r_photo, r_room, r_bed, r_people, r_price, order_time,all_price FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE ghr.`r_uid`=?  AND  ghr.`r_title` LIKE ? LIMIT " + offset + ',' + pageSize;
        pool.query(sql, [uid, title], (error, results) => {
            if (error) throw error;
            ////////////////////////
            let sql = "SELECT COUNT(oid) AS count FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE ghr.`r_uid`=? AND  ghr.`r_title` LIKE ? ";
            let rowcount;
            let pagecount;
            pool.query(sql, [uid, title], (err, result) => {
                if (err) throw err;
                rowcount = result[0].count;
                pagecount = Math.ceil(rowcount / pageSize);
                res.send({ message: '查询成功', code: 1, results, pagecount });
            })
        });
    }
});

//订单详情接口by张玥
server.get('/orderDetails', (req, res) => {
    let oid = parseInt(req.query.oid);
    let sql = 'SELECT r_title, old_town, enter_time, leave_time, r_room, r_bed, r_people, o_enter_person_name, o_enter_person_phone, o_enter_person_idcard, all_price, r_margin FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE go.`oid`=?';
    pool.query(sql, [oid], (error, results) => {
        if (error) throw error;
        res.send({ message: '查询成功', code: 1, results: results[0] });
    });
});


//获取所有 古镇分类接口 by鑫 (调试完成)
server.get('/town', (req, res) => {
    //查找古镇表中所有数据 
    let sql = 'SELECT tid,old_town,t_cid FROM gz_old_town';
    //通过MySQL连接池执行SQL语句
    pool.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ message: '查询成功', code: 1, results: results });
    });
});
//获取所有 城市分类接口 by鑫 (调试完成)
server.get('/city', (req, res) => {
    //查找城市表中的所有数据
    let sql = 'SELECT cid,city FROM gz_city';
    //通过MySQL连接池执行SQL语句
    pool.query(sql, (err, results) => {
        if (err) throw err;
        res.send({ message: '查询成功', code: 1, results: results });
    });
});


//搜索列表接口 by鑫  (调试完成)
//获取特定城市下的房源信息的接口
server.get('/search', (req, res) => {
    //从URL参数中获取cid  -- 房源信息ID
    let cid = req.query.cid;
    //从URL参数中获取page -- 页码
    let page = req.query.page;
    //存储每页显示的记录数
    let pagesize = 1;
    //根据MySQL分页的标准计算公式计算出offset参数值,并且带入到SQL语句中
    let offset = (page - 1) * pagesize;
    //现以接收到cid为条件进行房源信息的查找,此时的pagesize才是真正的返回多少条记录呢
    let sql = 'SELECT rid,r_cid,r_title,r_address,r_describe,r_photo,r_price,r_margin,r_room,r_hall,r_toilet,r_bed,r_people,r_fac,r_know FROM gz_home_resources WHERE r_cid = ? LIMIT ' + offset + ',' + pagesize;
    //总记录数
    let rowcount;
    //总页数
    let pagecount;
    //SQL
    pool.query(sql, [cid], (err, result) => {
        if (err) throw err;
        /////////////////   
        //记录数
        sql = 'SELECT COUNT(rid) AS count FROM gz_home_resources WHERE r_cid=?';
        pool.query(sql, [cid], (err, results) => {
            if (err) throw err;
            rowcount = results[0].count;
            //计算总页数
            pagecount = Math.ceil(rowcount / pagesize);
            //返回数据及总页数信息
            res.send({ message: '查询成功', code: 1, results: result, pagecount: pagecount });
        });
        /////////////////
    })
});



//详情界面接口 by鑫 (调试完成)
server.get('/details', (req, res) => {
    //获取房子的id
    let id = req.query.id;
    console.log(id)
    //SQL查询 -- 
    //
    let sql = 'SELECT rid,r_title,r_address,r_describe,r_photo,r_price,r_margin,r_room,r_hall,r_toilet,r_bed,r_people,r_fac,r_know FROM gz_home_resources WHERE rid=?';
    //执行SQL语句
    pool.query(sql, [id], (error, results) => {
        if (error) throw error;
        res.send({ message: '查询成功', code: 1, result: results[0] });

    });
});

// 数据测试成功
// 向数据库放入订单信息
server.post("/saveorder", (req, res) => {
    //获取地址栏中传开的数据
    let data = req.body;
    // // 要插入的数据，按顺序来
    let dataInsert = Object.values(data).join("','")
    // console.log(req.body.r_uid )
    // 向数据库中插入数据
    let sql = "INSERT INTO gz_order(r_uid,o_rid,status,order_time,enter_time,leave_time,all_price,o_enter_person_name,o_enter_person_phone,o_enter_person_idcard) VALUES(' " + dataInsert + " ')";
    pool.query(sql, (err, result) => {
        if (err) throw err;
        // console.log( result )
        if (result.affectedRows) {
            res.send({ message: "添加成功", code: 1 })
        } else {
            res.send({ message: '添加失败', code: 0 })
        }
    })
    // console.log(Object.values(data).join())
    // 再次提交

})
// 接收注册的姓名和密码数据by王睿芳
//用户注册的接口
server.post('/register', (req, res) => {
    //接收用户以POST方式提交的数据
    let uname = req.body.uname;
    let upwd = req.body.upwd;
    let isrole = req.body.isrole;
    let phone = req.body.phone;
    let user_name = req.body.user_name;
    let user_id = req.body.user_id;


    //在xzqa_author数据表中uname字段要保证记录的唯一性
    //所以先需要检测用户名是否已经存在，
    let sql = 'SELECT uid FROM gz_user WHERE uname=?';

    pool.query(sql, [uname], (error, results) => {
        if (error) throw error;
        // 如果用户名不存在，则返回空数组 -- []
        // 如果用户名已存在，则返回只包含一个对象的数组,形如： [  { id: 11 } ]
        // 所以，通过数组的长度即可证明输入的用户名是否已经存在
        if (results.length == 0) {
            //将相关的信息写入到xzqa_author数据表
            // let isrole = CONVERT(isrole, SIGNED);
            sql = 'INSERT gz_user(uname,upwd,isrole,phone,user_name,user_id) VALUES(?,MD5(?),?,?,?,?)';
            pool.query(sql, [uname, upwd, isrole, phone, user_name, user_id], (error, results) => {
                if (error) throw error;
                res.send({ message: '注册成功', code: 1 });
            });
        } else {
            //产生合理的错误信息到客户端
            res.send({ message: '注册失败', code: 0 });
        }
    });
});





// 用户登陆的接口by 王睿芳
server.post('/login', (req, res) => {
    let uname = req.body.uname;
    let upwd = md5(req.body.upwd);
    // 现在要以输入的用户名和密码为条件进行查找
    let sql = 'select uid,uname,user_name,avatar,isrole from gz_user where uname=? and upwd=?';
    pool.query(sql, [uname, upwd], (err, results) => {
        if (err) throw err;
        //登陆成功
        if (results.length == 1) {
            res.send({ message: '登陆成功', code: 1, info: results[0] });

        } else {
            //登陆失败
            res.send({ message: '登陆失败', code: 0 });
        }
    })
})


// 如果找到，则代表用户登陆成功，用户名密码都正确
// 否则代表用户登陆失败
server.post("/saveorder", (req, res) => {
    //获取地址栏中传开的数据
    let data = req.body;
    // // 要插入的数据，按顺序来
    let dataInsert = Object.values(data).join("','")
    // console.log(req.body.r_uid )
    // 向数据库中插入数据
    let sql = "INSERT INTO gz_order(r_uid,o_rid,status,order_time,enter_time,leave_time,all_price,o_enter_person_name,o_enter_person_phone,o_enter_person_idcard) VALUES(' " + dataInsert + " ')";
    pool.query(sql, (err, result) => {
        if (err) throw err;
        // console.log( result )
        if (result.affectedRows) {
            res.send({ message: "添加成功", code: 1 })
        } else {
            res.send({ message: '添加失败', code: 0 })
        }
    })
    // console.log(Object.values(data).join())
    // 再次提交
    // 又一次提交
})




//首页
server.get('/index', (req, res) => {
    let sql = "select rid,r_title,r_price ,r_photo,r_people from gz_home_resources"
    pool.query(sql, (error, results) => {
        if (error) throw error;
        // console.log(results.slice(0, 4))
        res.send({ message: "首页加载成功", results: results.slice(0, 4) })
    })
})

//利用房源id获取信息
server.get("/getGzhome", (req, res) => {
    // 获取房源id
    let id = req.query.id;
    // 
    let time = req.query.time
    // console.log(id)
    let sql = "SELECT r_title,r_price,r_room,r_hall,r_toilet,r_people FROM gz_home_resources WHERE rid= ?";
    pool.query(sql, [id], (err, results) => {
        if (err) throw err;
        // 获取当前的订单入离时间
        let sql = "SELECT enter_time,leave_time FROM gz_order WHERE o_rid=? and enter_time> ?"
        pool.query(sql, [id, time], (err, result) => {
            if (err) throw err;
            res.send({ message: '数据获取ok', code: 1, result, results })
            // console.log(result)
            // console.log("ss--", results)
        })
        // console.log(results)
        // console.log(results)
    })
    // 又一次提交
    // 又一次提交
    // pool.query(sql)
    // 24号有一次提交
})