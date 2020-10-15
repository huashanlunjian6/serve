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
