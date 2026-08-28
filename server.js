const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// 使用临时目录存放数据，防止权限报错
const DATA_FILE = path.join('/tmp', 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readRecords() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveRecords(records) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
    } catch (e) {
        console.error("写入文件失败:", e);
    }
}

// 答题提交接口
app.post('/api/submit', (req, res) => {
    const { username, score, details } = req.body;
    const records = readRecords();
    
    const newRecord = {
        id: Date.now().toString(),
        username: username || '未命名',
        score: score !== undefined ? score : 0,
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };

    records.push(newRecord);
    saveRecords(records);
    
    console.log("收到新提交:", newRecord);
    res.json({ success: true, message: "提交成功" });
});

// 后台页面及数据获取
app.get('/admin.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>答题监控后台</title>
            <style>
                body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }
                .box { max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f0f0f0; }
                button { padding: 8px 15px; background: #1890ff; color: #fff; border: none; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>📊 答题监控后台</h2>
                <div id="login">
                    <input type="password" id="pwd" placeholder="请输入密码 admin123" style="padding:8px;">
                    <button onclick="load()">登录查看</button>
                </div>
                <div id="content" style="display:none;">
                    <button onclick="load()">🔄 刷新数据</button>
                    <table>
                        <thead><tr><th>姓名</th><th>得分</th><th>提交时间</th></tr></thead>
                        <tbody id="list"></tbody>
                    </table>
                </div>
            </div>
            <script>
                function load() {
                    const p = document.getElementById('pwd').value || "admin123";
                    fetch('/api/get-data?p=' + encodeURIComponent(p))
                    .then(r => r.json())
                    .then(data => {
                        document.getElementById('login').style.display = 'none';
                        document.getElementById('content').style.display = 'block';
                        const tbody = document.getElementById('list');
                        tbody.innerHTML = '';
                        if (!data || data.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="3">暂无提交记录，请前往前台做一套试卷提交试试</td></tr>';
                            return;
                        }
                        data.forEach(item => {
                            tbody.innerHTML += '<tr><td>'+item.username+'</td><td><b>'+item.score+'</b> 分</td><td>'+item.time+'</td></tr>';
                        });
                    });
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/get-data', (req, res) => {
    if (req.query.p === ADMIN_PASSWORD) {
        res.json(readRecords());
    } else {
        res.status(401).json([]);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
