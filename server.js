const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
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
        console.error(e);
    }
}

// 兼容所有可能的前台提交路径
app.post(['/api/submit', '/submit'], (req, res) => {
    const records = readRecords();
    const newRecord = {
        id: Date.now().toString(),
        username: req.body.username || req.body.name || '匿名',
        score: req.body.score !== undefined ? req.body.score : 0,
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };
    records.push(newRecord);
    saveRecords(records);
    res.json({ success: true });
});

// 兼容所有后台读取路径（包括 GET/POST /api/records 和 /api/get-data）
app.all(['/api/records', '/api/get-data'], (req, res) => {
    const pwd = req.headers['x-admin-password'] || req.body.password || req.query.p;
    if (pwd === ADMIN_PASSWORD) {
        res.json({ success: true, records: readRecords() });
    } else {
        res.status(401).json({ success: false, message: '密码错误' });
    }
});

// 强行把 /admin.html 拦截并输出可直接登录查看数据的网页
app.get('/admin.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>摄影测试答题后台</title>
            <style>
                body { font-family: sans-serif; background: #f4f6f9; padding: 20px; margin: 0; }
                .box { max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                input { padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; width: 60%; }
                button { padding: 10px 18px; font-size: 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #fafafa; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>📊 摄影测试答题监控后台</h2>
                <div id="login-box">
                    <input type="password" id="pwd" placeholder="默认密码：admin123">
                    <button onclick="login()">登录</button>
                </div>
                <div id="data-box" style="display:none;">
                    <button onclick="fetchData()">🔄 刷新数据</button>
                    <table>
                        <thead><tr><th>姓名</th><th>得分</th><th>提交时间</th></tr></thead>
                        <tbody id="tbody"></tbody>
                    </table>
                </div>
            </div>
            <script>
                function login() {
                    window.currentPwd = document.getElementById('pwd').value.trim() || 'admin123';
                    fetchData();
                }
                function fetchData() {
                    fetch('/api/records', {
                        headers: { 'x-admin-password': window.currentPwd }
                    })
                    .then(r => r.json())
                    .then(res => {
                        if (!res.success) { alert('密码错误'); return; }
                        document.getElementById('login-box').style.display = 'none';
                        document.getElementById('data-box').style.display = 'block';
                        const tbody = document.getElementById('tbody');
                        tbody.innerHTML = '';
                        const list = res.records || [];
                        if (list.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="3">暂无提交记录，可以先去前台做一次测试并提交</td></tr>';
                            return;
                        }
                        list.forEach(item => {
                            tbody.innerHTML += '<tr><td>'+item.username+'</td><td><b>'+item.score+'</b> 分</td><td>'+item.time+'</td></tr>';
                        });
                    })
                    .catch(() => alert('网络连接异常'));
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
