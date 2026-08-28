const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
  res.json({ok: req.body.pwd === ADMIN_PASS, token:"ok"});
});

app.get('/api/admin/list', (req,res)=>{
  res.json(answerList);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.listen(PORT);
