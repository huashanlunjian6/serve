//引入其他模块
const express = require('express');
const server = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const md5=require('md5');
const mysql = require('mysql');
//创建连接池 
const pool = mysql.createPool({
  //MySQL数据库服务器的地址
  host:'62.234.42.153',
  //端口号
  port:8306,
  //数据库用户的用户名
  user:'zy',
  //数据库用户的密码
  password:'by$kS!Bvb16MAF5O',
  //数据库名称
  database:'gzms',
  //最大连接数据
  connectionLimit:20
});

//解决跨域问题  不太确定是不是这么写
server.use(cors({
  origin:['http://127.0.0.1:8080','http://localhost:8080']
}));

//使用系统模块querystring来处理
server.use(bodyParser.urlencoded({
  extended:false
}));


server.listen(3000,()=>{
  console.log('server is running...');
});

//订单列表接口by张玥
server.post('/orderList',(req,res)=>{
  let role=parseInt(req.body.role);
  let uid=parseInt(req.body.uid);
  let page=parseInt(req.body.page);
  let pageSize=10;
  let offset=(page-1)*pageSize;
  if(role == 0){
    let sql='SELECT oid,r_title, old_town, r_room, r_bed, r_people, order_time,all_price FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE go.`r_uid`=? LIMIT '+ offset + ',' + pageSize;
    pool.query(sql,[uid],(error,results)=>{
      if(error) throw error;
      res.send({message:'查询成功',code:1,results});
    });
  }else{
    let sql='SELECT oid,r_title, old_town, r_room, r_bed, r_people, order_time,all_price FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE ghr.`r_uid`=? LIMIT '+ offset + ',' + pageSize;
    pool.query(sql,[uid],(error,results)=>{
      if(error) throw error;
      res.send({message:'查询成功',code:1,results});
    });
  }
});

//订单详情接口by张玥
server.post('/orderDetails',(req,res)=>{
  let oid=parseInt(req.body.oid);
  let sql='SELECT r_title, old_town, enter_time, leave_time, r_room, r_people, o_enter_person_name, o_enter_person_phone, o_enter_person_idcard, all_price, r_margin FROM gz_order go LEFT JOIN gz_home_resources ghr ON o_rid=rid LEFT JOIN gz_old_town got ON got.`tid`=ghr.`r_tid` WHERE go.`oid`=?';
  pool.query(sql,[oid],(error,results)=>{
    if(error) throw error;
    res.send({message:'查询成功',code:1,results});
  });
});
