const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATA_FILE = path.join(__dirname, 'data', 'records.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 确保数据目录和文件存在
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readRecords() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

// 标准答案
const answerKey = {
  1:"B",2:"C",3:"B",4:"C",5:"B",6:"C",7:"B",8:"A",9:"D",10:"B",
  11:"B",12:"B",13:"B",14:"B",15:"A",16:"B",17:"C",18:"C",19:"C",20:"B",
  21:"B",22:"C",23:"B",24:"C",25:"B",26:"A",27:"B",28:"A",29:"B",30:"B",
  31:"ABC",32:"ABCD",33:"ABC",34:"ABC",35:"ABCD",36:"ABCD",37:"ABC",38:"ABC",39:"ABCD",40:"ABC"
};

// 题目数据
const questions = [
  {id:1,type:"single",title:'摄影中，"快门速度"主要影响的是',opts:["画面的色温","进光量与运动物体的动态效果","镜头焦距","图像分辨率"]},
  {id:2,type:"single",title:"在光圈、快门、ISO三者中，能够直接影响景深的是",opts:["快门速度","ISO","光圈","白平衡"]},
  {id:3,type:"single",title:"拍摄人物肖像时，使用较大光圈通常可以",opts:["增加景深","让背景更加虚化","降低进光量","让画面更加锐利"]},
  {id:4,type:"single",title:"下列哪种情况最适合使用高速快门？",opts:["拍摄流水的丝滑效果","拍摄夜景建筑","拍摄运动中的篮球运动员","拍摄静止的人像"]},
  {id:5,type:"single",title:'摄影中的"白平衡"主要用于调整',opts:["画面亮度","画面色彩偏差","图片分辨率","快门速度"]},
  {id:6,type:"single",title:"下列哪一种构图方式最强调主体位于画面中央？",opts:["三分法构图","对角线构图","中心构图","框架构图"]},
  {id:7,type:"single",title:"拍摄人物时，人物视线前方通常应该适当留出空间，这种做法主要是为了",opts:["增加画面重量感","增强视觉延伸感","降低画面亮度","突出背景细节"]},
  {id:8,type:"single",title:'视频中"特写"镜头最适合表现',opts:["人物的情绪和细节","整个校园环境","大型活动的整体规模","人物与环境的空间关系"]},
  {id:9,type:"single",title:"下列哪一种镜头最适合表现人物与环境之间的关系？",opts:["大特写","特写","中景","全景"]},
  {id:10,type:"single",title:'视频中"推镜头"通常指',opts:["摄像机向后移动","摄像机向前移动或逐渐接近主体","摄像机左右移动","摄像机上下翻转"]},
  {id:11,type:"single",title:'"摇镜头"是指',opts:["摄像机位置发生明显移动","摄像机固定位置，镜头水平或垂直转动","镜头焦距发生变化","摄像机快速旋转360°"]},
  {id:12,type:"single",title:'下列哪项最能体现"剪辑节奏"？',opts:["视频文件大小","镜头长短与切换速度","摄像机品牌","视频分辨率"]},
  {id:13,type:"single",title:"一个视频中连续使用大量很短的镜头，通常会产生",opts:["缓慢舒缓的节奏","紧张、快速的节奏","静止感","怀旧感"]},
  {id:14,type:"single",title:'"转场"在视频剪辑中的主要作用是',opts:["提高相机像素","连接不同镜头或场景","改变视频分辨率","增加拍摄光线"]},
  {id:15,type:"single",title:'下列哪一种剪辑方式最容易制造"时间流逝"的感觉？',opts:["蒙太奇剪辑","长时间固定机位","单镜头采访","静帧画面"]},
  {id:16,type:"single",title:"在视频剪辑中，BGM最重要的作用之一是",opts:["增加视频文件大小","营造情绪和氛围","提高画面分辨率","自动修复画面"]},
  {id:17,type:"single",title:"如果采访对象说话声音很小，而背景音乐很大，最应该优先调整的是",opts:["降低人声","提高BGM音量","降低BGM并突出人声","删除所有声音"]},
  {id:18,type:"single",title:"新闻摄影最重要的原则之一是",opts:["越夸张越好","追求视觉冲击而改变事实","真实、准确地记录事件","尽可能使用滤镜"]},
  {id:19,type:"single",title:"一篇优秀的校园新闻标题通常应该",opts:["越长越详细越好","尽量使用生僻词","准确、简洁并突出核心信息","使用大量网络流行语"]},
  {id:20,type:"single",title:'"标题党"最主要的问题是',opts:["标题太短","标题与内容不符或故意夸大","标题没有标点","标题使用黑体"]},
  {id:21,type:"single",title:'新媒体运营中，"用户画像"主要用于',opts:["预测天气","分析目标受众特征","调整摄像机参数","修改视频格式"]},
  {id:22,type:"single",title:'如果传媒社准备发布一条"校园运动会精彩瞬间"视频，下列标题最好的是',opts:["《震惊！你绝对想不到今天学校发生了什么！》","《运动会？？？》","《奔跑、呐喊与热爱｜校园运动会精彩瞬间》","《快来看！》"]},
  {id:23,type:"single",title:'下列哪项最符合短视频开头"黄金几秒"的特点？',opts:["长时间展示片头Logo","迅速呈现核心内容或冲突点","先播放30秒纯音乐","先展示制作人员名单"]},
  {id:24,type:"single",title:"在校园宣传片中，以下哪种方式最容易增强真实感？",opts:["所有人面对镜头摆拍","大量使用夸张特效","捕捉自然状态下的人物互动","所有画面都使用慢动作"]},
  {id:25,type:"single",title:'"景别"主要描述的是',opts:["摄影机品牌","主体在画面中的大小和范围","视频声音大小","画面色彩"]},
  {id:26,type:"single",title:"下列哪个属于常见的视频剪辑软件？",opts:["Premiere Pro","Photoshop","Excel","PowerPoint"]},
  {id:27,type:"single",title:"Photoshop主要属于哪一类软件？",opts:["音频制作","图像处理","数据库管理","三维建模"]},
  {id:28,type:"single",title:"如果一张照片主体很暗，而背景非常亮，最可能出现的问题是",opts:["曝光不均衡","白平衡完全正确","快门速度一定过快","镜头焦距一定过长"]},
  {id:29,type:"single",title:'摄影中"黄金时刻"通常指',opts:["正午12点","日出或日落前后的柔和光线时段","深夜12点","下雨的时候"]},
  {id:30,type:"single",title:"如果你发现自己拍摄的视频画面不断晃动，最有效的改进方式之一是",opts:["提高饱和度","使用稳定设备或稳定拍摄方式","增加BGM","提高视频音量"]},
  {id:31,type:"multi",title:"摄影中的曝光三要素包括",opts:["光圈","快门速度","ISO","白平衡"]},
  {id:32,type:"multi",title:"以下哪些属于常见构图方式？",opts:["三分法构图","对称构图","对角线构图","框架构图"]},
  {id:33,type:"multi",title:"拍摄校园人物采访时，比较重要的是",opts:["保证人物声音清晰","注意光线","保持画面稳定","采访者一直抢镜"]},
  {id:34,type:"multi",title:"优秀的校园宣传视频通常应该具备",opts:["明确主题","良好的画面质量","合理的剪辑节奏","与主题无关的大量特效"]},
  {id:35,type:"multi",title:"下列哪些因素会影响照片的最终观感？",opts:["构图","光线","色彩","主体选择"]},
  {id:36,type:"multi",title:"下列哪些属于视频后期制作的常见内容？",opts:["剪辑","调色","音频处理","字幕制作"]},
  {id:37,type:"multi",title:"传媒社成员在校园拍摄时应该注意",opts:["尊重被拍摄者","注意个人隐私","遵守学校规定","为了效果可以随意传播他人隐私"]},
  {id:38,type:"multi",title:"一条优秀的新媒体文案通常应该",opts:["有明确的信息","有一定吸引力","符合目标受众","故意制造虚假信息"]},
  {id:39,type:"multi",title:"以下哪些属于传媒社可能承担的工作？",opts:["摄影","摄像","视频剪辑","活动宣传"]},
  {id:40,type:"multi",title:'如果要制作一条"校园社团招新"短视频，可以使用的素材包括',opts:["社团活动画面","成员采访","社团环境","与社团完全无关的随机素材"]}
];

function calcScore(answers) {
  let score = 0;
  for (let qid in answerKey) {
    const std = answerKey[qid];
    const my = (answers[qid] || '').toString().toUpperCase();
    if (Number(qid) <= 30) {
      if (my === std) score += 1;
    } else {
      const stdArr = std.split('');
      const myArr = my.split('').filter(x => x);
      const allRight = myArr.length === stdArr.length && myArr.every(c => stdArr.includes(c));
      const someRight = myArr.length > 0 && myArr.every(c => stdArr.includes(c)) && !allRight;
      if (allRight) score += 2;
      else if (someRight) score += 1;
    }
  }
  return score;
}

function getLevel(score) {
  if (score >= 45) return '重点培养对象，传媒基础和媒介敏感度较强';
  if (score >= 38) return '优秀，适合进入核心培养';
  if (score >= 30) return '良好，有培养潜力';
  if (score >= 20) return '基础水平，可结合面试观察';
  return '建议结合面试实操进一步判断';
}

// API: 获取题目
app.get('/api/questions', (req, res) => {
  res.json({ questions, examDuration: 15 * 60 });
});

// API: 提交答卷
app.post('/api/submit', (req, res) => {
  const { username, answers } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: '请填写考生姓名' });
  }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: '答卷数据无效' });
  }

  const score = calcScore(answers);
  const level = getLevel(score);
  const record = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    username: username.trim(),
    score,
    level,
    answers,
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    timestamp: Date.now()
  };

  const records = readRecords();
  records.push(record);
  writeRecords(records);

  res.json({ success: true, score, level, recordId: record.id });
});

// 管理员验证中间件
function authAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '管理员密码错误' });
  }
  next();
}

// API: 获取所有答卷（管理员）
app.get('/api/records', authAdmin, (req, res) => {
  const records = readRecords();
  // 返回时不包含完整answers，减少传输量
  const list = records.map(r => ({
    id: r.id,
    username: r.username,
    score: r.score,
    level: r.level,
    time: r.time,
    timestamp: r.timestamp
  })).sort((a, b) => b.timestamp - a.timestamp);
  res.json({ records: list, total: list.length });
});

// API: 获取单条答卷详情
app.get('/api/records/:id', authAdmin, (req, res) => {
  const records = readRecords();
  const record = records.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: '答卷不存在' });
  res.json(record);
});

// API: 统计数据
app.get('/api/stats', authAdmin, (req, res) => {
  const records = readRecords();
  const total = records.length;
  const avgScore = total > 0 ? (records.reduce((s, r) => s + r.score, 0) / total).toFixed(1) : 0;
  const maxScore = total > 0 ? Math.max(...records.map(r => r.score)) : 0;
  const distribution = {
    '45-50': records.filter(r => r.score >= 45).length,
    '38-44': records.filter(r => r.score >= 38 && r.score < 45).length,
    '30-37': records.filter(r => r.score >= 30 && r.score < 38).length,
    '20-29': records.filter(r => r.score >= 20 && r.score < 30).length,
    '0-19': records.filter(r => r.score < 20).length
  };
  res.json({ total, avgScore, maxScore, distribution });
});

// API: 清空所有答卷
app.delete('/api/records', authAdmin, (req, res) => {
  writeRecords([]);
  res.json({ success: true });
});

// API: 导出所有答卷
app.get('/api/export', authAdmin, (req, res) => {
  const records = readRecords();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=media_exam_records.json');
  res.send(JSON.stringify(records, null, 2));
});

app.listen(PORT, () => {
  console.log(`传媒社招新答题系统已启动: http://localhost:${PORT}`);
  console.log(`后台管理密码: ${ADMIN_PASSWORD}`);
});
