const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const DATA_FILE = path.join(__dirname, 'data', 'records.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readRecords() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
        return [];
    }
}

function writeRecords(records) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

const answerKey = {
    "1":"B","2":"C","3":"B","4":"C","5":"B","6":"C","7":"A","8":"C","9":"A","10":"C",
    "11":"B","12":"B","13":"B","14":"B","15":"A","16":"C","17":"B","18":"C","19":"B","20":"A",
    "21":"B","22":"C","23":"B","24":"C","25":"B","26":"A","27":"B","28":"C","29":"B","30":"C",
    "31":"ABC","32":"ABCD","33":"ABC","34":"ABC","35":"AB","36":"ABC","37":"AC","38":"ABC","39":"ABD","40":"ABC"
};

const questions = [
    {id:1,type:"single",title:"摄影中，…"},
    {id:2,type:"single",title:"在光圈、快…"},
    {id:3,type:"single",title:"拍摄人物肖…"},
    {id:4,type:"single",title:"下列哪种情…"},
    {id:5,type:"single",title:"摄影中的\"…"},
    {id:6,type:"single",title:"下列哪一种…"},
    {id:7,type:"single",title:"拍摄人物时…"},
    {id:8,type:"single",title:"拍摄中特别…"},
    {id:9,type:"single",title:"视频中\"特…"},
    {id:10,type:"single",title:"下列哪一种…"},
    {id:11,type:"single",title:"\"摇镜头\"…"},
    {id:12,type:"single",title:"下列哪项属…"},
    {id:13,type:"single",title:"一个视频镜…"},
    {id:14,type:"single",title:"\"转场\"在…"},
    {id:15,type:"single",title:"下列哪一项…"},
    {id:16,type:"single",title:"在视频剪辑…"},
    {id:17,type:"single",title:"如果采访一…"},
    {id:18,type:"single",title:"新闻摄影最…"},
    {id:19,type:"single",title:"一篇优秀新…"},
    {id:20,type:"single",title:"标题党\"主…"},
    {id:21,type:"single",title:"新媒体时代…"},
    {id:22,type:"single",title:"如果传媒社…"},
    {id:23,type:"single",title:"下列哪项不…"},
    {id:24,type:"single",title:"在校园宣传…"},
    {id:25,type:"single",title:"\"景别\"主…"},
    {id:26,type:"single",title:"下列哪个软…"},
    {id:27,type:"single",title:"Photoshop…"},
    {id:28,type:"single",title:"如果一张照…"},
    {id:29,type:"single",title:"摄影中\"黄…"},
    {id:30,type:"single",title:"如果你要发…"},
    {id:31,type:"multi",title:"摄影中的曝…"},
    {id:32,type:"multi",title:"以下哪些属…"},
    {id:33,type:"multi",title:"拍摄校园人…"},
    {id:34,type:"multi",title:"优秀的校园…"},
    {id:35,type:"multi",title:"下列哪些因…"},
    {id:36,type:"multi",title:"下列哪些属…"},
    {id:37,type:"multi",title:"传媒社团招…"},
    {id:38,type:"multi",title:"一条优秀短…"},
    {id:39,type:"multi",title:"以下哪些属…"},
    {id:40,type:"multi",title:"如果要制作…"}
];

function calcScore(answers){
    let score = 0;
    for(let qid in answerKey){
        const std = answerKey[qid];
        const my = (answers[qid]||'').toString();
        if(Number(qid) <= 30){
            if(my === std) score +=1;
        }else{
            const stdArr = std.split('').filter(x=>x);
            const myArr = my.split('').filter(x=>x);
            const allRight = myArr.length === stdArr.length && myArr.every(v=>stdArr.includes(v));
            const someRight = myArr.some(v=>stdArr.includes(v));
            if(allRight) score +=2;
            else if(someRight) score +=1;
        }
    }
    return score;
}

function getLevel(score){
    if(score >= 45) return '重点培养对象';
    if(score >= 38) return '优秀，适合进核心组';
    if(score >= 30) return '良好，有培养潜力';
    if(score >= 20) return '基础水平，可以进一步学习';
    return '建议结合面试实操进一步判断';
}

app.get('/api/questions',(req,res)=>{
    res.json({ questions, examDuration:30*60*1000 });
});

app.post('/api/submit',(req,res)=>{
    const { username, answers } = req.body;
    if(!username || !username.trim()){
        return res.status(400).json({err:"请填写姓名"});
    }
    if(!answers || typeof answers !== 'object'){
        return res.status(400).json({err:"答卷数据异常"});
    }
    const score = calcScore(answers);
    const level = getLevel(score);
    const record = {
        id:Date.now()+'-'+Math.random().toString(36).slice(2),
        username:username.trim(),
        score,
        level,
        answers,
        time:new Date().toLocaleString('zh-CN'),
        timestamp:Date.now()
    };
    const records = readRecords();
    records.push(record);
    writeRecords(records);
    res.json({ success:true, score, level });
});

function authAdmin(req,res,next){
    const password = req.headers['x-admin-pwd'];
    if(password !== ADMIN_PASSWORD){
        return res.status(401).json({err:"未授权"});
    }
    next();
}

app.get('/api/records',authAdmin,(req,res)=>{
    const records = readRecords();
    const list = records.map(r=>({
        id:r.id,
        username:r.username,
        score:r.score,
        level:r.level,
        time:r.time,
        timestamp:r.timestamp
    })).sort((a,b)=>b.timestamp-a.timestamp);
    res.json({ records:list, total:list.length });
});

app.get('/api/records/:id',authAdmin,(req,res)=>{
    const records = readRecords();
    const rec = records.find(x=>x.id === req.params.id);
    if(!rec) return res.status(404).json({err:"不存在"});
    res.json(rec);
});

app.get('/api/stats',authAdmin,(req,res)=>{
    const records = readRecords();
    const total = records.length;
    const avgScore = total>0 ? records.reduce((s,r)=>s+r.score,0)/total : 0;
    const maxScore = total>0 ? Math.max(...records.map(r=>r.score)) : 0;
    res.json({ total, avgScore, maxScore });
});

app.delete('/api/records',authAdmin,(req,res)=>{
    writeRecords([]);
    res.json({ success:true });
});

app.get('/api/export',authAdmin,(req,res)=>{
    const records = readRecords();
    res.setHeader('Content-Type','application/json;charset=utf-8');
    res.setHeader('Content-Disposition','attachment;filename=records.json');
    res.send(JSON.stringify(records,null,2));
});

app.listen(PORT,()=>{
    console.log(`传媒招新答题系统已启动，端口${PORT}`);
    console.log('后台管理密码：',ADMIN_PASSWORD);
});
