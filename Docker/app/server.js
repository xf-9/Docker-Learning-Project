// 引入所需的模块
let express = require('express'); // Express框架
let path = require('path'); // 处理文件和目录路径
let fs = require('fs'); // 文件系统模块，用于读取文件
let MongoClient = require('mongodb').MongoClient; // MongoDB客户端
let bodyParser = require('body-parser'); // 中间件，用于解析请求体
let app = express(); // 创建Express应用实例

// 使用中间件解析URL编码的请求体和JSON请求体
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 定义根路由，返回index.html文件
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html")); // 发送index.html文件
});

// 定义路由，返回用户的个人资料图片
app.get('/profile-picture', function (req, res) {
  // 读取并返回指定路径的图片
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg")); // 读取图片文件
  res.writeHead(200, { 'Content-Type': 'image/jpg' }); // 设置响应头
  res.end(img, 'binary'); // 以二进制格式返回图片
});

// 根据环境选择MongoDB连接字符串
let mongoUrl = process.env.NODE_ENV === 'production' ? 
  "mongodb://admin:password@mongo:27017" : // 生产环境：连接Docker中的MongoDB
  "mongodb://admin:password@localhost:27017"; // 本地开发环境：连接本地MongoDB

// MongoDB客户端连接选项
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true }; // 连接选项
let databaseName = "my-db"; // 数据库名称

// 更新用户资料的路由
app.post('/update-profile', function (req, res) {
  let userObj = req.body; // 从请求体获取用户数据

  // 连接到MongoDB
  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) {
      console.error("Failed to connect to MongoDB", err); // 连接失败的错误日志
      return res.status(500).send({ error: "Database connection failed" }); // 返回500错误
    }

    let db = client.db(databaseName); // 获取数据库实例
    userObj['userid'] = 1; // 设置用户ID为1

    let myquery = { userid: 1 }; // 查询条件
    let newvalues = { $set: userObj }; // 更新的值

    // 更新用户资料，如果没有则插入
    db.collection("users").updateOne(myquery, newvalues, { upsert: true }, function(err, result) {
      if (err) {
        console.error("Error updating profile", err); // 更新失败的错误日志
        client.close(); // 关闭MongoDB连接
        return res.status(500).send({ error: "Update failed" }); // 返回500错误
      }
      client.close(); // 关闭MongoDB连接
      res.send(userObj); // 返回更新后的用户对象
    });
  });
});

// 获取用户资料的路由
app.get('/get-profile', function (req, res) {
  // 连接到MongoDB
  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) {
      console.error("Failed to connect to MongoDB", err); // 连接失败的错误日志
      return res.status(500).send({ error: "Database connection failed" }); // 返回500错误
    }

    let db = client.db(databaseName); // 获取数据库实例
    let myquery = { userid: 1 }; // 查询条件

    // 查询用户资料
    db.collection("users").findOne(myquery, function (err, result) {
      if (err) {
        console.error("Error fetching profile", err); // 查询失败的错误日志
        client.close(); // 关闭MongoDB连接
        return res.status(500).send({ error: "Fetch failed" }); // 返回500错误
      }
      client.close(); // 关闭MongoDB连接
      res.send(result ? result : {}); // 返回查询结果，若无结果则返回空对象
    });
  });
});

// 启动Express服务器，监听3000端口
app.listen(3000, function () {
  console.log("app listening on port 3000!"); // 输出服务器启动信息
});
