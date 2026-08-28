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

// 提交答题 API
app.post('/api/submit', (req, res) => {
    const { username, score, details } = req.body;
    const records = readRecords();
    records.push({
        id: Date.now().toString(),
        username: username || '匿名',
        score: score || 0,
        details: details || {},
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
    res.json({ success: true });
});

// 直接在路由中返回后台 HTML 页面，100% 避免 404
app.get('/admin.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>摄影测试 - 管理员后台</title>
            <style>
                body { font-family: sans-serif; background: #f4f6f9; padding: 20px; }
                .box { max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
                input { padding: 8px; width: 60%; margin-right: 10px; }
                button { padding: 8px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #eee; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>📊 摄影测试答题监控后台</h2>
                <div id="login-form">
                    <input type="password" id="pwd" placeholder="请输入密码 admin123">
                    <button onclick="login()">登录查看</button>
                </div>
                <div id="data-area" style="display:none;">
                    <h3>提交记录</h3>
                    <table>
                        <thead><tr><th>姓名</th><th>得分</th><th>时间</th></tr></thead>
                        <tbody id="list"></tbody>
                    </table>
                </div>
            </div>
            <script>
                function login() {
                    const p = document.getElementById('pwd').value;
                    if (p !== "${ADMIN_PASSWORD}") { alert('密码错误'); return; }
                    fetch('/api/get-data?p=' + encodeURIComponent(p))
                    .then(r => r.json())
                    .then(data => {
                        document.getElementById('login-form').style.display = 'none';
                        document.getElementById('data-area').style.display = 'block';
                        const tbody = document.getElementById('list');
                        tbody.innerHTML = '';
                        if(!data.length) { tbody.innerHTML = '<tr><td colspan="3">暂无记录</td></tr>'; return; }
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

// 获取数据 API
app.get('/api/get-data', (req, res) => {
    if (req.query.p === ADMIN_PASSWORD) {
        res.json(readRecords());
    } else {
        res.status(401).json([]);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
