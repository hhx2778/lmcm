const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// API 接口
app.get('/api/questions', (req, res) => {
  res.json({
    questions: [],
    examDuration: 1800000
  });
});

app.post('/api/submit', (req, res) => {
  const body = req.body;
  const filename = Date.now() + ".json";
  fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(body, null, 2), err => {
    if(err) return res.status(500).json({ok:false});
    res.json({ok:true});
  });
});

const ADMIN_PASS = "123456";
app.post('/api/admin/login', (req,res)=>{
  if(req.body.pwd === ADMIN_PASS){
    return res.json({ok:true,token:"ok"});
  }
  res.json({ok:false});
});

app.get('/api/admin/list', (req,res)=>{
  const files = fs.readdirSync(DATA_DIR);
  const list = [];
  for(const f of files){
    const raw = fs.readFileSync(path.join(DATA_DIR,f),'utf-8');
    list.push(JSON.parse(raw));
  }
  res.json(list);
});

// 单独给 /admin 返回管理员页面
app.get('/admin', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','admin.html'));
});

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 兜底，放在最后
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.listen(PORT);
