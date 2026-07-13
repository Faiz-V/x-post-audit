使用方法

1. 双击 start.command。
2. 在打开的面板中点击“登录采集账号”。
3. 完成 X 登录。
4. 添加需要监控的账号。
5. 点击“采集全部账号”。
6. 在看板中查看运营数据。

## 普通用户说明

首次启动会自动创建本地运行环境、安装依赖和 Chromium、生成加密密钥、初始化 SQLite，并打开 `http://127.0.0.1:8765`。不需要安装 Docker、配置 PostgreSQL、编辑 `.env` 或执行命令行工具。

采集账号仅用于读取公开数据。一个公司授权的采集账号可以监控多个公开 X 账号；被监控账号不需要在本机登录，也不会被面板控制。登录有效期间，关闭再启动系统会复用本机加密保存的 Session。

停止服务时双击 `stop.command`。停止不会删除数据库、登录 Session、账号配置、目标配置或历史快照。

## 面板操作

- “登录采集账号”：打开有界面的 Chromium，由用户手动输入 X 凭据并自行完成验证码或安全验证。系统不保存密码。
- “添加监控账号”：支持用户名、`@username`、x.com/twitter.com 链接、批量粘贴和 CSV 的 `username` 列。
- “采集全部账号”：使用同一个 `observer-default` Session 依次采集所有启用账号。某个账号失败不会中断其他账号；Session 失效会暂停任务并提示重新登录。
- 账号对比、帖子分析、蹭评论分析和采集健康：默认读取真实 SQLite 数据。
- 数据源选择：“真实数据”为默认值；“演示数据”会持续显示醒目标识，且不会写入真实指标。
- CSV：账号、帖子、蹭评论均可导出。空白表示当前无法获取，数字 `0` 只表示已确认的零值。

真实数据库没有采集结果时，面板会明确显示：

> 尚未完成真实数据采集。请先登录采集账号、添加监控账号并开始采集。

## 数据范围与限制

系统使用 Playwright 正常打开 X 页面，优先解析页面自然产生的结构化网络响应，并以 DOM 可见数据作为备用。不接入 X 官方 API，不构造或重放未公开 GraphQL 请求，不自动填写凭据，不绕过验证码、安全挑战或限流，也不使用代理或采集账号自动轮换。

支持公开账号资料、公开帖子/回复/引用/转发、公开浏览、点赞、评论、转发、引用、页面可获得的收藏和粉丝数据。以下数据无法保证：私有 Analytics、链接点击、主页访问、关注来源、广告、私信、受保护账号内容和仅所有者可见指标。页面没有返回的浏览或收藏保存为 `NULL`，不会推算成 `0`。

Storage State 使用 AES-256-GCM 加密后保存在本机。密钥位于 `backend/data/session.key`，数据库位于 `backend/data/x_dashboard.db`，日志位于 `backend/data/logs/app.log`。这些文件均被 Git 忽略。前端和日志不会输出 Cookie、Token 或 Storage State。

X 页面结构、字段开放范围和登录策略可能变化。遇到 Session 过期、安全挑战、限流、受保护账号、账号不存在或页面结构变化时，面板会保留历史数据并显示失败状态。

## 开发者说明

技术栈：FastAPI、SQLAlchemy、SQLite（默认，可通过 `DATABASE_URL` 切换 PostgreSQL）、Playwright Chromium，以及现有 HTML/CSS/JavaScript 前端。

```text
twitter/
├── start.command / stop.command
├── index.html / app.js / styles.css
├── backend/
│   ├── data/                       # 本地数据库、密钥和日志，不提交
│   ├── migrations/                 # PostgreSQL 迁移保留
│   ├── src/x_dashboard/
│   │   ├── api/ collectors/ extractors/ models/ repositories/
│   │   ├── scheduler/ security/ services/
│   │   └── main.py
│   └── tests/
└── fixtures/                       # 虚构脱敏测试数据
```

开发检查：

```bash
cd /Users/levies/Documents/twitter
backend/.venv/bin/ruff format --check backend/src backend/tests backend/migrations
backend/.venv/bin/ruff check backend/src backend/tests backend/migrations
backend/.venv/bin/mypy backend/src
backend/.venv/bin/pytest backend/tests
```

本地服务默认只监听 `127.0.0.1:8765`。开发者仍可设置 `.env` 中的 `DATABASE_URL`、采集频率、超时、滚动次数和指标覆盖帖子数；普通运营用户无需编辑这些配置。
