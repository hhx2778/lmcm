const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// 静态资源优先，所有html直接可访问
app.use(express.static(path.join(__dirname, 'public')));

// 内存存储答卷
let answerList = [];
const ADMIN_PASS = "123456";

//题目接口
app.get('/api/questions', (req, res) => {
  res.json({
    questions: [],
    examDuration: 1800000
  });
});

//提交答卷
app.post('/api/submit', (req, res) => {
  answerList.push(req.body);
  res.json({ ok: true });
});

//管理员登录
app.post('/api/admin/login', (req,res)=>{
  res.json({ok: req.body.pwd === ADMIN_PASS});
});

//获取答卷
app.get('/api/admin/list', (req,res)=>{
  res.json(answerList);
});

//兜底只拦截未定义路径
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.listen(PORT);
