# 高中传媒社招新答题系统

基于 Node.js + Express 的在线答题系统，支持手机端，含 15 分钟倒计时、自动判分、后台管理。

## 功能

- 考生端：40 道题（30 单选 + 10 多选），15 分钟倒计时，自动判分评级
- 后台管理：密码登录，成绩统计，分数分布，答卷详情查看，导出 JSON
- 数据持久化：答卷存储在服务端 JSON 文件

## 本地运行

```bash
npm install
npm start
```

访问 http://localhost:3000

## 部署到 Render（免费）

### 第一步：上传代码到 GitHub

1. 注册/登录 GitHub（https://github.com）
2. 新建仓库（New Repository），名称随意（如 `media-exam`），选 Public
3. 将本项目所有文件上传到该仓库

### 第二步：在 Render 部署

1. 注册/登录 Render（https://render.com），可用 GitHub 账号登录
2. 点击右上角 **New +** → **Web Service**
3. 选择你刚才创建的 GitHub 仓库，点击 **Connect**
4. 填写配置：
   - **Name**: `media-exam`（会成为网址的一部分）
   - **Region**: 选 Oregon（美国，免费）
   - **Runtime**: Node
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: 选 **Free**
5. 点击 **Create Web Service**
6. 等待 2-3 分钟，部署完成后会显示网址，格式为 `https://你的项目名.onrender.com`

### 第三步：设置管理员密码（可选）

在 Render 服务页面 → **Environment** → 添加环境变量：
- Key: `ADMIN_PASSWORD`
- Value: 你想要的密码

保存后会自动重新部署。

## 访问地址

部署成功后：
- 考生答题页：`https://你的项目名.onrender.com`
- 后台管理：`https://你的项目名.onrender.com/admin.html`
- 默认管理员密码：`admin123`

## 注意事项

1. **免费套餐休眠**：Render 免费实例 15 分钟无访问会休眠，下次访问需等待约 30 秒启动，属正常现象。
2. **数据存储**：答卷存在实例本地文件，实例重新部署或迁移时数据可能丢失。招新结束后请及时在后台导出 JSON 备份。
3. **如需长期稳定使用**：可升级 Render 付费套餐，或接入数据库（如 Supabase 免费 PostgreSQL）。

## 项目结构

```
├── server.js          # 后端服务
├── package.json       # 依赖配置
├── render.yaml        # Render 部署配置（可选）
├── data/
│   └── records.json   # 答卷数据（自动生成）
└── public/
    ├── index.html     # 考生答题页
    └── admin.html     # 后台管理页
```
