const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 确保数据文件存在
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

// 提交答题接口
app.post('/api/submit', (req, res) => {
    const { username, score, details } = req.body;
    const records = readRecords();
    const newRecord = {
        id: Date.now().toString(),
        username: username || '匿名',
        score: score || 0,
        details: details || {},
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        timestamp: Date.now()
    };
    records.push(newRecord);
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
    res.json({ success: true });
});

// 管理员获取记录接口（同时支持 POST 和 GET 提交密码）
app.post('/api/records', (req, res) => {
    const { password } = req.body;
    const headerPassword = req.headers['x-admin-password'];
    
    if (password === ADMIN_PASSWORD || headerPassword === ADMIN_PASSWORD) {
        const records = readRecords();
        res.json({ success: true, records: records });
    } else {
        res.status(401).json({ success: false, message: '密码错误' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
