const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
// 同时托管根目录和 public 目录，防止文件位置放错导致 404
app.use(express.static(__dirname));
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

// 兼容直接访问 data.json
app.get('/data.json', (req, res) => {
    res.sendFile(DATA_FILE);
});

// 即使 admin.html 找不到，也兜底返回一个后台页面
app.get('/admin.html', (req, res) => {
    const adminPathInPublic = path.join(__dirname, 'public', 'admin.html');
    const adminPathInRoot = path.join(__dirname, 'admin.html');

    if (fs.existsSync(adminPathInPublic)) {
        res.sendFile(adminPathInPublic);
    } else if (fs.existsSync(adminPathInRoot)) {
        res.sendFile(adminPathInRoot);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>后台</title></head>
            <body style="padding:20px;font-family:sans-serif;">
                <h2>管理员后台</h2>
                <input type="password" id="p" placeholder="输入密码 admin123">
                <button onclick="check()">登录</button>
                <pre id="out" style="margin-top:20px;"></pre>
                <script>
                    function check(){
                        if(document.getElementById('p').value === 'admin123'){
                            fetch('/data.json').then(r=>r.text()).then(t=>{
                                document.getElementById('out').innerText = t;
                            });
                        } else { alert('密码错误'); }
                    }
                </script>
            </body>
            </html>
        `);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
