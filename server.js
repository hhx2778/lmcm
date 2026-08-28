
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//内存存答卷，不读写磁盘，规避Render只读文件系统限制
let answerList = [];

app.get('/api/questions', (req, res) => {
  res.json({
    questions: [],
    examDuration: 1800000
  });
});

app.post('/api/submit', (req, res) => {
  answerList.push(req.body);
  res.json({ ok: true });
});

const ADMIN_PASS = "123456";
app.post('/api/admin/login', (req,res)=>{
  if(req.body.pwd === ADMIN_PASS){
    return res.json({ok:true,token:"ok"});
  }
  res.json({ok:false});
});

app.get('/api/admin/list', (req,res)=>{
  res.json(answerList);
});

app.get('/admin', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','admin.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.listen(PORT);
