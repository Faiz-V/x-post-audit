const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const TYPE_LABEL = { ORIGINAL: "原创", REPLY: "回复", QUOTE: "引用", REPOST: "转发", UNKNOWN: "未知" };
const SESSION_LABEL = {
  ACTIVE: "已登录", EXPIRED: "需要重新登录", CHALLENGED: "安全验证中",
  RATE_LIMITED: "访问受限", DISABLED: "已停用", UNKNOWN: "状态未知",
  LOGIN_WINDOW_OPEN: "等待手动登录",
};
const STEP_LABEL = {
  CHECK_SESSION: "检查采集账号状态", READ_PROFILE: "读取账号资料",
  DISCOVER_HOME: "发现主页内容", DISCOVER_REPLIES: "发现回复内容",
  CLASSIFY_POSTS: "识别帖子类型", CLASSIFY_EXTERNAL_REPLIES: "识别蹭评论",
  COLLECT_METRICS: "采集帖子指标", SAVE_DATA: "保存数据",
  CALCULATE_METRICS: "计算运营指标", COMPLETE: "完成",
};
const COLORS = [["#edf1ff", "#cbd5ff", "#33428a"], ["#effaf6", "#c9ecdf", "#21745b"], ["#fff5e6", "#f5d7a5", "#8a5d16"], ["#f5efff", "#dacbfa", "#65469d"]];

const DEMO = {
  setup: { service: "READY", database: "READY", chromium: "READY", monitored_accounts: 3, last_collected_at: "2026-07-13T10:42:00Z", session: { name: "demo-observer", status: "ACTIVE", last_success_at: "2026-07-13T10:42:00Z" }, real_data_ready: false },
  overview: { has_real_data: true, range: { days: 30, start: "2026-06-14", end: "2026-07-13" }, kpis: { monitored_accounts: 3, posts: 41, external_replies: 28, views_increment: 238400, interactions_increment: 8260, followers_delta: 1128, target_completion_rate: null, data_coverage_rate: .91 }, trend: [
    { date: "2026-07-07", posts: 4, external_replies: 3, views: 18200, interactions: 720, followers: 80 },
    { date: "2026-07-08", posts: 7, external_replies: 5, views: 37600, interactions: 1340, followers: 186 },
    { date: "2026-07-09", posts: 5, external_replies: 4, views: 29400, interactions: 980, followers: 121 },
    { date: "2026-07-10", posts: 8, external_replies: 6, views: 48100, interactions: 1730, followers: 214 },
    { date: "2026-07-11", posts: 6, external_replies: 3, views: 33100, interactions: 1120, followers: 143 },
    { date: "2026-07-12", posts: 7, external_replies: 5, views: 44600, interactions: 1580, followers: 236 },
    { date: "2026-07-13", posts: 4, external_replies: 2, views: 27400, interactions: 790, followers: 148 },
  ] },
  accounts: { has_real_data: true, items: [
    { id: "demo-1", username: "NovaLabs", display_name: "Nova Labs", owner_name: "李明", team_name: "增长组", account_group: "产品", language: "en", followers: 128400, followers_delta: 612, original_posts: 17, external_replies: 12, views_increment: 98200, interactions_increment: 3240, average_views: 5776, data_coverage_rate: .96, last_collected_at: "2026-07-13T10:42:00Z", collection_status: "ACTIVE", collection_enabled: true },
    { id: "demo-2", username: "MiraBuilds", display_name: "Mira Builds", owner_name: "王晨", team_name: "品牌组", account_group: "品牌", language: "en", followers: 87200, followers_delta: 374, original_posts: 14, external_replies: 9, views_increment: 81400, interactions_increment: 2810, average_views: 5814, data_coverage_rate: .92, last_collected_at: "2026-07-13T10:37:00Z", collection_status: "ACTIVE", collection_enabled: true },
    { id: "demo-3", username: "PredX_CN", display_name: "PredX 中文", owner_name: "周宁", team_name: "海外组", account_group: "区域", language: "zh", followers: 43900, followers_delta: 142, original_posts: 10, external_replies: 7, views_increment: 58800, interactions_increment: 2210, average_views: 5880, data_coverage_rate: .84, last_collected_at: "2026-07-13T09:55:00Z", collection_status: "COLLECTION_FAILED", collection_enabled: true },
  ] },
  posts: { has_real_data: true, items: [
    { post_id: "demo-post-1", author_username: "NovaLabs", post_type: "ORIGINAL", text: "A practical launch checklist for small AI product teams.", created_at: "2026-07-12T18:06:00Z", permalink: "#", public_views: 63800, views_increment_24h: 9260, like_count: 1247, reply_count: 72, repost_count: 136, quote_count: 28, bookmark_count: 311, data_status: "COMPLETE", quality_flags: [] },
    { post_id: "demo-post-2", author_username: "MiraBuilds", post_type: "REPLY", text: "The durable advantage is the feedback loop, not the first model choice.", created_at: "2026-07-12T11:42:00Z", permalink: "#", public_views: 41800, views_increment_24h: 7130, like_count: 784, reply_count: 41, repost_count: 62, quote_count: null, bookmark_count: null, data_status: "PARTIAL", quality_flags: ["BOOKMARKS_MISSING"] },
  ] },
  replies: { has_real_data: true, items: [
    { post_id: "demo-post-2", author_username: "MiraBuilds", text: "The durable advantage is the feedback loop, not the first model choice.", created_at: "2026-07-12T11:42:00Z", root_author_username: "example_kol", reply_delay_minutes: 18, root_post_views: 1400000, public_views: 41800, like_count: 784, reply_count: 41, permalink: "#" },
  ] },
  health: { session: { name: "demo-observer", status: "ACTIVE", last_success_at: "2026-07-13T10:42:00Z" }, last_success_at: "2026-07-13T10:42:00Z", current_jobs: [], recent_jobs: [], success_rate_24h: .94, issues: [], log_path: "演示数据不读取本地日志" },
  targets: { engagement_targets: [], operational_targets: [] },
};

const state = { mode: "real", period: 30, setup: null, overview: null, accounts: null, posts: null, replies: null, health: null, targets: null, postFilter: "ALL", eventSource: null };

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}
function formatNumber(value) { return value == null ? "—" : new Intl.NumberFormat("zh-CN").format(value); }
function compact(value) {
  if (value == null) return "—";
  const sign = value < 0 ? "-" : ""; const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${sign}${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}${(absolute / 1_000).toFixed(1)}K`;
  return String(value);
}
function percent(value) { return value == null ? "—" : `${(value * 100).toFixed(1)}%`; }
function localTime(value) { return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—"; }
function avatarStyle(index) { const colors = COLORS[index % COLORS.length]; return `--avatar-a:${colors[0]};--avatar-b:${colors[1]};--avatar-ink:${colors[2]}`; }
function emptyRow(columns, message = "暂无真实数据") { return `<tr><td colspan="${columns}" class="empty-cell">${message}</td></tr>`; }

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.detail?.message || `请求失败（${response.status}）`);
  }
  return response.json();
}

async function loadReal() {
  setConnection("正在读取真实数据", "warn");
  try {
    const [setup, overview, accounts, posts, replies, health, targets] = await Promise.all([
      api("/api/setup/status"), api(overviewUrl()), api("/api/dashboard/accounts?days=" + state.period),
      api("/api/dashboard/posts?limit=500"), api("/api/dashboard/external-replies?limit=500"),
      api("/api/collector/health"), api("/api/dashboard/targets"),
    ]);
    Object.assign(state, { setup, overview, accounts, posts, replies, health, targets });
    setConnection("已连接本地服务", "ok");
    renderAll();
  } catch (error) {
    setConnection("本地服务连接失败", "danger");
    showToast(error.message);
  }
}

function overviewUrl() {
  const params = new URLSearchParams({ days: state.period });
  const map = { accountFilter: "account_id", ownerFilter: "owner", teamFilter: "team", groupFilter: "account_group", languageFilter: "language" };
  for (const [id, key] of Object.entries(map)) { const value = $("#" + id)?.value; if (value && value !== "all") params.set(key, value); }
  return "/api/dashboard/overview?" + params;
}

function useDemo() {
  Object.assign(state, JSON.parse(JSON.stringify(DEMO)));
  state.mode = "demo";
  renderAll();
}

function renderAll() {
  document.body.classList.toggle("demo-mode", state.mode === "demo");
  let mark = $(".demo-watermark");
  if (state.mode === "demo" && !mark) { mark = document.createElement("div"); mark.className = "demo-watermark"; mark.textContent = "演示数据"; document.body.append(mark); }
  if (state.mode !== "demo") mark?.remove();
  $("#dataModeBadge").innerHTML = `<span class="live-dot"></span>${state.mode === "demo" ? "演示数据 · 不代表真实采集结果" : "真实数据 · 本地服务"}`;
  renderSetup(); renderFilters(); renderOverview(); renderAccounts(); renderPosts(); renderReplies(); renderHealth(); renderTargets();
  const hasReal = Boolean(state.overview?.has_real_data);
  $("#realEmpty").hidden = state.mode !== "real" || hasReal;
}

function renderSetup() {
  const setup = state.setup || {}; const session = setup.session || {};
  const active = session.status === "ACTIVE";
  $("#setupHeadline").textContent = state.mode === "demo" ? "当前正在查看演示数据" : active ? "采集账号已登录，可以开始采集" : "请先登录采集账号";
  $("#setupStatus").innerHTML = [
    ["本地服务", setup.service], ["数据库", setup.database], ["Chromium", setup.chromium],
    ["采集账号", SESSION_LABEL[session.status] || session.status], ["监控账号", setup.monitored_accounts ?? 0], ["最近采集", localTime(setup.last_collected_at)],
  ].map(item => `<div><span>${item[0]}</span><b>${escapeHtml(item[1] ?? "—")}</b></div>`).join("");
  $("#sidebarSession").innerHTML = `<span class="status-dot ${active ? "ok" : "warn"}"></span><div><b>${escapeHtml(session.name || "observer-default")}</b><small>${escapeHtml(SESSION_LABEL[session.status] || "尚未登录")}</small></div>`;
  $("#loginCollector").textContent = active ? "重新登录采集账号" : "登录采集账号";
  const needsAttention = !active && state.mode === "real";
  $("#alertBanner").classList.toggle("hidden", !needsAttention);
  $("#alertTitle").textContent = session.status === "EXPIRED" ? "采集账号登录已失效" : "采集账号尚未登录";
  $("#alertText").textContent = session.status === "EXPIRED" ? "请重新登录后继续采集。历史数据不会被删除。" : "登录一次后，同一个 Session 可监控全部公开账号。";
}

function renderFilters() {
  const items = state.accounts?.items || [];
  const configs = [
    ["accountFilter", "全部账号", items.map(item => [item.id, `@${item.username}`])],
    ["ownerFilter", "全部负责人", uniqueOptions(items, "owner_name")],
    ["teamFilter", "全部团队", uniqueOptions(items, "team_name")],
    ["groupFilter", "全部分类", uniqueOptions(items, "account_group")],
    ["languageFilter", "全部语言", uniqueOptions(items, "language")],
  ];
  for (const [id, label, options] of configs) {
    const select = $("#" + id); const previous = select.value;
    select.innerHTML = `<option value="all">${label}</option>` + options.map(([value, text]) => `<option value="${escapeHtml(value)}">${escapeHtml(text)}</option>`).join("");
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }
}
function uniqueOptions(items, key) { return [...new Set(items.map(item => item[key]).filter(Boolean))].sort().map(value => [value, value]); }

function renderOverview() {
  const data = state.overview || { kpis: {}, trend: [] }; const k = data.kpis || {};
  const values = [
    ["监控账号数", formatNumber(k.monitored_accounts)], ["发帖数", formatNumber(k.posts)],
    ["蹭评论数", formatNumber(k.external_replies)], ["公开浏览新增", compact(k.views_increment)],
    ["互动新增", compact(k.interactions_increment)], ["粉丝净增", k.followers_delta == null ? "—" : `${k.followers_delta >= 0 ? "+" : ""}${formatNumber(k.followers_delta)}`],
    ["目标完成率", percent(k.target_completion_rate)], ["数据覆盖率", percent(k.data_coverage_rate)],
  ];
  $("#kpiGrid").innerHTML = values.map(item => `<article class="kpi-card"><span>${item[0]}</span><strong>${item[1]}</strong><footer><b>真实口径</b>${state.period} 天</footer></article>`).join("");
  $("#overviewCoverage").textContent = percent(k.data_coverage_rate);
  $("#overviewRange").textContent = data.range ? `${data.range.start} – ${data.range.end} · UTC` : `最近 ${state.period} 天 · UTC`;
  $("#chartTotal").textContent = compact(k.views_increment);
  $(".chart-summary em").textContent = data.has_real_data ? "公开日增量" : "尚无真实数据";
  renderChart(data.trend || []);
  const accounts = [...(state.accounts?.items || [])].sort((a, b) => (b.views_increment || 0) - (a.views_increment || 0));
  $("#rankingList").innerHTML = accounts.slice(0, 5).map((item, index) => `<div class="rank-row"><span class="rank-no">${index + 1}</span><span class="account-avatar" style="${avatarStyle(index)}">${escapeHtml(item.username.slice(0, 2).toUpperCase())}</span><div class="account-copy"><b>@${escapeHtml(item.username)}</b><small>${escapeHtml(item.owner_name || "未分配负责人")}</small></div><div class="rank-value"><b>${compact(item.views_increment)}</b><small>${percent(item.data_coverage_rate)}</small></div></div>`).join("") || `<div class="empty-mini">暂无账号排行</div>`;
  renderOwnerSummary(accounts);
  renderContentStructure();
  renderOverviewHealth();
}

function renderChart(trend) {
  if (!trend.length) { $("#comboChart").innerHTML = `<div class="chart-empty">暂无日增量数据</div>`; return; }
  const maxViews = Math.max(...trend.map(row => row.views || 0), 1); const maxPosts = Math.max(...trend.map(row => Math.max(row.posts || 0, row.external_replies || 0)), 1);
  const labels = trend.map(row => row.date.slice(5));
  const points = trend.map((row, index) => `${trend.length === 1 ? 50 : index / (trend.length - 1) * 100},${100 - (row.views || 0) / maxViews * 88}`).join(" ");
  $("#comboChart").innerHTML = `<div class="chart-y-labels"><span>${compact(maxViews)}</span><span>${compact(maxViews / 2)}</span><span>0</span></div><div class="bar-columns">${trend.map((row, index) => `<div class="bar-column"><i style="height:${(row.posts || 0) / maxPosts * 82}%"></i><i class="reply" style="height:${(row.external_replies || 0) / maxPosts * 82}%"></i><label>${labels[index]}</label></div>`).join("")}</div><svg class="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M ${points.replaceAll(" ", " L ")}"></path></svg>`;
}

function renderOwnerSummary(accounts) {
  const grouped = {};
  for (const item of accounts) { const owner = item.owner_name || "未分配"; grouped[owner] ||= { accounts: 0, views: 0, knownViews: 0, followers: 0 }; grouped[owner].accounts++; if (item.views_increment != null) { grouped[owner].views += item.views_increment; grouped[owner].knownViews++; } grouped[owner].followers += item.followers_delta || 0; }
  $("#ownerGoals").innerHTML = Object.entries(grouped).slice(0, 4).map(([owner, row], index) => `<div class="goal-row"><span class="avatar" style="${avatarStyle(index)}">${escapeHtml(owner.slice(0, 1))}</span><div class="goal-meta"><span><b>${escapeHtml(owner)}</b><small>${row.accounts} 个账号</small></span><div class="progress"><i style="width:${row.knownViews ? Math.min(100, row.views / Math.max(...Object.values(grouped).map(v => v.views), 1) * 100) : 0}%"></i></div></div><div class="goal-value"><b>${row.knownViews ? compact(row.views) : "—"}</b><small>浏览新增</small></div></div>`).join("") || `<div class="empty-mini">暂无负责人数据</div>`;
}

function renderContentStructure() {
  const posts = state.posts?.items || []; const counts = { ORIGINAL: 0, QUOTE: 0, REPLY: 0, REPOST: 0 };
  posts.forEach(post => { if (post.post_type in counts) counts[post.post_type]++; });
  const external = posts.filter(post => post.is_external_reply === true).length; const ordinaryReplies = Math.max(counts.REPLY - external, 0); const total = posts.length;
  const layout = $(".donut-layout"); if (!layout) return;
  layout.innerHTML = `<div class="donut"><div><b>${total}</b><span>已发现内容</span></div></div><div class="donut-legend"><span><i class="dot c1"></i>原创 <b>${counts.ORIGINAL}</b></span><span><i class="dot c2"></i>引用 <b>${counts.QUOTE}</b></span><span><i class="dot c3"></i>蹭评论 <b>${external}</b></span><span><i class="dot c4"></i>普通回复 <b>${ordinaryReplies}</b></span><span><i class="dot c5"></i>转发 <b>${counts.REPOST}</b></span></div>`;
  layout.closest(".card").querySelector(".card-head p").textContent = `当前筛选共 ${total} 次活动`;
}

function renderOverviewHealth() {
  const health = state.health || {}; const rate = health.success_rate_24h;
  const card = $(".health-card"); if (!card) return;
  card.querySelector(".health-score").textContent = percent(rate);
  card.querySelector(".health-ring").style.background = `conic-gradient(var(--green) 0 ${(rate || 0) * 100}%,#edf0f4 ${(rate || 0) * 100}% 100%)`;
  card.querySelector(".health-ring b").textContent = percent(rate);
  const jobs = health.recent_jobs || []; const success = jobs.filter(job => ["SUCCEEDED", "PARTIAL"].includes(job.status)).length; const failed = jobs.filter(job => ["FAILED", "BLOCKED"].includes(job.status)).length; const waiting = jobs.filter(job => ["PENDING", "RUNNING"].includes(job.status)).length;
  card.querySelector(".health-stats").innerHTML = `<span><b>${success}</b>成功</span><span><b class="danger">${failed}</b>失败</span><span><b class="warn-text">${waiting}</b>等待</span>`;
}

function visibleAccounts() {
  const query = ($("#accountSearch")?.value || "").toLowerCase();
  return (state.accounts?.items || []).filter(item => `${item.username} ${item.display_name || ""} ${item.owner_name || ""}`.toLowerCase().includes(query));
}
function renderAccounts() {
  const items = visibleAccounts(); const followers = items.reduce((sum, item) => sum + (item.followers_delta || 0), 0); const posts = items.reduce((sum, item) => sum + (item.original_posts || 0), 0); const views = items.reduce((sum, item) => sum + (item.views_increment || 0), 0);
  $("#accountKpis").innerHTML = [["管理账号", items.length, `${items.filter(item => item.collection_status === "ACTIVE").length} 个正常采集`], ["粉丝净增", `${followers >= 0 ? "+" : ""}${formatNumber(followers)}`, "允许负增长"], ["平均单帖浏览", posts ? formatNumber(Math.round(views / posts)) : "—", "缺失不按 0 计算"], ["数据已采集", items.filter(item => item.last_collected_at).length, `共 ${items.length} 个账号`]].map(item => `<div><span>${item[0]}</span><b>${item[1]}</b><small>${item[2]}</small></div>`).join("");
  $("#accountCount").textContent = `共 ${items.length} 个账号`;
  $("#accountTableBody").innerHTML = items.map((item, index) => `<tr><td><div class="account-cell"><span class="account-avatar" style="${avatarStyle(index)}">${escapeHtml(item.username.slice(0, 2).toUpperCase())}</span><div class="account-copy"><b>@${escapeHtml(item.username)}</b><small>${escapeHtml(item.display_name || "尚未采集显示名称")}</small></div></div></td><td>${escapeHtml(item.owner_name || "—")}<br><small>${escapeHtml(item.team_name || "—")}</small></td><td>${formatNumber(item.followers)}</td><td class="metric-main"><b>${item.followers_delta == null ? "—" : `${item.followers_delta >= 0 ? "+" : ""}${formatNumber(item.followers_delta)}`}</b><small>${state.period} 天</small></td><td>${formatNumber(item.original_posts)}</td><td>${formatNumber(item.external_replies)}</td><td>—</td><td class="metric-main"><b>${compact(item.views_increment)}</b><small>周期新增</small></td><td>—</td><td><span class="tag ${item.data_coverage_rate < .9 ? "warn" : "quote"}">${percent(item.data_coverage_rate)}</span></td><td><button class="more-row" data-account="${escapeHtml(item.id)}">•••</button></td></tr>`).join("") || emptyRow(11, state.mode === "real" ? "尚未添加监控账号" : "演示账号为空");
}

function filteredPosts() {
  const query = ($("#postSearch")?.value || "").toLowerCase();
  return (state.posts?.items || []).filter(post => (state.postFilter === "ALL" || post.post_type === state.postFilter) && `${post.author_username} ${post.text || ""}`.toLowerCase().includes(query));
}
function renderPosts() {
  const all = state.posts?.items || []; const items = filteredPosts();
  $$('[data-post-filter]').forEach(button => { const count = button.dataset.postFilter === "ALL" ? all.length : all.filter(post => post.post_type === button.dataset.postFilter).length; button.textContent = `${button.dataset.postFilter === "ALL" ? "全部" : TYPE_LABEL[button.dataset.postFilter]} ${count}`; });
  $("#missingPosts").textContent = `数据缺失 ${all.filter(post => post.data_status !== "COMPLETE").length}`;
  $("#postTableBody").innerHTML = items.map((post, index) => { const interaction = [post.like_count, post.reply_count, post.repost_count, post.quote_count].every(value => value == null) ? null : (post.like_count || 0) + (post.reply_count || 0) + (post.repost_count || 0) + (post.quote_count || 0); const rate = post.public_views != null && interaction != null && post.public_views > 0 ? interaction / post.public_views * 100 : null; return `<tr><td><div class="post-cell"><span class="account-avatar" style="${avatarStyle(index)}">${escapeHtml(post.author_username.slice(0, 2).toUpperCase())}</span><div class="post-copy"><b>${escapeHtml(post.text || "（无可见正文）")}</b><small>@${escapeHtml(post.author_username)} · ${localTime(post.created_at)}</small></div></div></td><td><span class="tag ${post.post_type.toLowerCase()}">${TYPE_LABEL[post.post_type] || post.post_type}</span></td><td class="metric-main"><b>${compact(post.public_views)}</b><small>${post.public_views == null ? "当前无法获取" : "累计公开值"}</small></td><td>${post.views_increment_24h == null ? "—" : "+" + compact(post.views_increment_24h)}</td><td>${formatNumber(post.like_count)}</td><td>${formatNumber(post.reply_count)}</td><td>${rate == null ? "—" : rate.toFixed(2) + "%"}</td><td><span class="completeness ${post.data_status === "COMPLETE" ? "" : "missing"}"><i></i>${post.data_status === "COMPLETE" ? "完整" : post.data_status === "MISSING" ? "缺失" : "部分缺失"}</span></td><td>${post.permalink && post.permalink !== "#" ? `<a class="more-row" href="${escapeHtml(post.permalink)}" target="_blank" rel="noopener">↗</a>` : "—"}</td></tr>`; }).join("") || emptyRow(9);
}

function renderReplies() {
  const items = state.replies?.items || []; const views = items.reduce((sum, item) => sum + (item.public_views || 0), 0); const complete = items.filter(item => item.public_views != null); const target = items.filter(item => item.external_reply_type === "TARGET_ACCOUNT_REPLY").length;
  const unknown = (state.posts?.items || []).filter(item => item.post_type === "REPLY" && item.is_external_reply == null).length;
  $("#replyTargetCount").textContent = `目标账号 ${(state.targets?.engagement_targets || []).length} 个`;
  $("#replySummary").textContent = `${items.length} 条可确认 · ${unknown} 条待判定`;
  $("#replyKpis").innerHTML = [["蹭评论总数", items.length], ["目标账号蹭评论", target], ["有公开浏览", complete.length], ["浏览覆盖率", items.length ? percent(complete.length / items.length) : "—"], ["蹭评论浏览量", compact(views)], ["平均评论浏览", complete.length ? formatNumber(Math.round(views / complete.length)) : "—"]].map(item => `<div><span>${item[0]}</span><b>${item[1]}</b><small>公开数据口径</small></div>`).join("");
  const grouped = {}; items.forEach(item => { const key = item.root_author_username || "根作者未知"; grouped[key] ||= { count: 0, views: 0 }; grouped[key].count++; grouped[key].views += item.public_views || 0; }); const max = Math.max(...Object.values(grouped).map(row => row.views), 1);
  $("#targetChart").innerHTML = Object.entries(grouped).slice(0, 6).map(([name, row]) => `<div class="target-row"><label>@${escapeHtml(name)}</label><div class="target-bar"><i style="width:${row.views / max * 100}%"></i></div><b>${compact(row.views)}<small>${row.count} 条回复</small></b></div>`).join("") || `<div class="chart-empty">暂无可确认的蹭评论</div>`;
  $("#scatterChart").innerHTML = items.filter(item => item.reply_delay_minutes != null && item.public_views != null).slice(0, 30).map((item, index, points) => `<i class="scatter-dot" title="${item.reply_delay_minutes} 分钟 / ${item.public_views} 浏览" style="left:${Math.min(94, item.reply_delay_minutes / Math.max(...points.map(row => row.reply_delay_minutes), 1) * 90)}%;bottom:${Math.min(94, item.public_views / Math.max(...points.map(row => row.public_views), 1) * 90)}%;opacity:${.95 - index * .015}"></i>`).join("");
  $("#replyTableBody").innerHTML = items.map((item, index) => `<tr><td><div class="account-cell"><span class="account-avatar" style="${avatarStyle(index)}">${escapeHtml(item.author_username.slice(0, 2).toUpperCase())}</span><div class="account-copy"><b>@${escapeHtml(item.author_username)}</b><small>${localTime(item.created_at)}</small></div></div></td><td style="max-width:260px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(item.text || "—")}</td><td>${item.root_author_username ? "@" + escapeHtml(item.root_author_username) : "—"}</td><td>${item.reply_delay_minutes == null ? "—" : item.reply_delay_minutes + " 分钟"}</td><td>${compact(item.root_post_views)}</td><td><b>${compact(item.public_views)}</b></td><td>${item.like_count == null && item.reply_count == null ? "—" : formatNumber((item.like_count || 0) + (item.reply_count || 0))}</td><td><span class="tag ${item.public_views == null ? "warn" : "quote"}">${item.public_views == null ? "待补指标" : "已确认"}</span></td><td>${item.permalink && item.permalink !== "#" ? `<a class="more-row" href="${escapeHtml(item.permalink)}" target="_blank" rel="noopener">↗</a>` : "—"}</td></tr>`).join("") || emptyRow(9);
}

function renderHealth() {
  const health = state.health || {}; const session = health.session || {}; const jobs = health.recent_jobs || []; const issues = health.issues || [];
  const healthCount = issues.length + jobs.filter(job => ["FAILED", "BLOCKED", "PARTIAL"].includes(job.status)).length;
  const navCount = $('.nav-item[data-view="health"] .nav-count'); if (navCount) { navCount.textContent = healthCount; navCount.hidden = healthCount === 0; }
  const issueCount = $("#issueCount"); if (issueCount) { issueCount.textContent = issues.length; issueCount.hidden = issues.length === 0; }
  $("#sessionList").innerHTML = `<div class="session-row"><div class="session-name"><span class="status-dot ${session.status === "ACTIVE" ? "ok" : "warn"}"></span><div><b>${escapeHtml(session.name || "observer-default")}</b><small>一个 Session 监控多个账号</small></div></div><span>${localTime(session.last_success_at)}</span><span><span class="tag ${session.status === "ACTIVE" ? "quote" : "danger"}">${escapeHtml(SESSION_LABEL[session.status] || session.status || "未知")}</span></span><button class="text-button" id="healthLogin">${session.status === "ACTIVE" ? "重新登录" : "登录"}</button></div>`;
  $("#issueList").innerHTML = issues.map(issue => `<div class="issue-row ${issue.code?.startsWith("SESSION") ? "critical" : ""}"><span class="issue-symbol">!</span><div><b>${escapeHtml(issue.code)}</b><small>${escapeHtml(issue.message)}</small></div><time>${localTime(issue.created_at)}</time></div>`).join("") || `<div class="empty-mini">没有待处理异常</div>`;
  $("#jobTableBody").innerHTML = jobs.map(job => { const duration = job.started_at && job.finished_at ? Math.max(0, Math.round((new Date(job.finished_at) - new Date(job.started_at)) / 1000)) + "s" : "—"; return `<tr><td><b>${escapeHtml(job.job_type)}</b></td><td>${job.total_accounts} 个账号</td><td>${escapeHtml(job.session_name)}</td><td>${localTime(job.scheduled_at)}</td><td>${duration}</td><td>${formatNumber(job.records_written)}</td><td><span class="tag ${["SUCCEEDED", "PARTIAL"].includes(job.status) ? "quote" : ["FAILED", "BLOCKED"].includes(job.status) ? "danger" : ""}">${escapeHtml(job.status)}</span></td><td>${["FAILED", "BLOCKED", "PARTIAL"].includes(job.status) ? `<button class="more-row" data-retry="${escapeHtml(job.id)}">重试</button>` : ""}</td></tr>`; }).join("") || emptyRow(8, "暂无采集任务");
  const successRate = health.success_rate_24h; const overview = $(".health-overview"); if (overview) overview.innerHTML = `<div class="health-hero"><span>24 小时任务成功率</span><b>${percent(successRate)}</b><small>部分完成计为可用任务</small></div><div><span>24h 任务</span><b>${jobs.length}</b><small>${jobs.filter(job => ["SUCCEEDED", "PARTIAL"].includes(job.status)).length} 个可用</small></div><div><span>待处理问题</span><b>${issues.length}</b><small>历史数据不会被删除</small></div><div><span>当前任务</span><b>${(health.current_jobs || []).length}</b><small>可查看实时进度</small></div><div><span>最近成功</span><b>${health.last_success_at ? localTime(health.last_success_at).split(" ").pop() : "—"}</b><small>${health.last_success_at ? localTime(health.last_success_at).split(" ")[0] : "尚无"}</small></div>`;
}

function renderTargets() {
  const targets = state.targets || { engagement_targets: [], operational_targets: [] };
  const names = targets.engagement_targets.slice(0, 5).map(item => `@${item.username}`).join("、");
  $("#targetSummary").textContent = `已配置 ${targets.engagement_targets.length} 个重点互动账号、${targets.operational_targets.length} 个运营目标。${names ? `重点账号：${names}。` : ""}目标数据与真实采集数据独立保存。`;
  $("#mockTarget").textContent = "＋ 新建目标";
}

function openTargetForm() {
  if (!requireReal()) return;
  const accounts = state.accounts?.items || [];
  openModal(`<h2 class="modal-title" id="modalTitle">新建目标</h2><p class="modal-sub">重点互动账号用于区分目标账号蹭评论；运营目标支持日、周、月口径。</p><form id="targetForm"><div class="form-grid"><label class="form-field full"><span>目标类型</span><select id="targetKind"><option value="engagement">重点互动账号</option><option value="operational">运营指标目标</option></select></label><div id="engagementFields" class="form-field full"><span>X 账号</span><input id="targetUsername" placeholder="@example_kol"></div><label id="categoryField" class="form-field full"><span>类别</span><select id="targetCategory"><option>KOL</option><option>MEDIA</option><option>INDUSTRY</option><option>COMPETITOR</option><option>COMMUNITY</option></select></label><label class="form-field operational-field" hidden><span>监控账号</span><select id="targetAccount"><option value="">按负责人</option>${accounts.map(item => `<option value="${escapeHtml(item.id)}">@${escapeHtml(item.username)}</option>`).join("")}</select></label><label class="form-field operational-field" hidden><span>负责人</span><input id="targetOwner" placeholder="按账号时可留空"></label><label class="form-field operational-field" hidden><span>周期</span><select id="targetPeriod"><option value="DAY">每日</option><option value="WEEK">每周</option><option value="MONTH">每月</option></select></label><label class="form-field operational-field" hidden><span>周期开始日</span><input id="targetStart" type="date" value="${new Date().toISOString().slice(0, 10)}"></label><label class="form-field operational-field" hidden><span>原创/引用目标</span><input id="targetPosts" type="number" min="0"></label><label class="form-field operational-field" hidden><span>蹭评论目标</span><input id="targetReplies" type="number" min="0"></label><label class="form-field operational-field" hidden><span>公开浏览新增目标</span><input id="targetViews" type="number" min="0"></label><label class="form-field operational-field" hidden><span>粉丝增长目标</span><input id="targetFollowers" type="number"></label></div><div class="modal-actions"><button type="button" class="secondary-button" data-close-modal>取消</button><button type="submit" class="primary-button">保存目标</button></div></form>`);
  $("#targetKind").addEventListener("change", event => { const operational = event.target.value === "operational"; $("#engagementFields").hidden = operational; $("#categoryField").hidden = operational; $$(".operational-field").forEach(field => field.hidden = !operational); });
  $("#targetForm").addEventListener("submit", async event => { event.preventDefault(); try { if ($("#targetKind").value === "engagement") { await api("/api/targets/engagement", { method: "POST", body: JSON.stringify({ username: $("#targetUsername").value, category: $("#targetCategory").value }) }); } else { const numberOrNull = id => $(id).value === "" ? null : Number($(id).value); await api("/api/targets/operational", { method: "POST", body: JSON.stringify({ account_id: $("#targetAccount").value || null, owner_name: $("#targetOwner").value || null, period_type: $("#targetPeriod").value, period_start: $("#targetStart").value, original_post_target: numberOrNull("#targetPosts"), external_reply_target: numberOrNull("#targetReplies"), total_views_target: numberOrNull("#targetViews"), follower_growth_target: numberOrNull("#targetFollowers") }) }); } closeModal(); showToast("目标已保存"); await loadReal(); } catch (error) { showToast(error.message); } });
}

function setConnection(text, tone) { $("#refreshStatus").innerHTML = `<span class="status-dot ${tone === "ok" ? "ok" : "warn"}"></span>${text}`; }
let toastTimer;
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3500); }
function openModal(content) { $("#modalContent").innerHTML = content; $("#modalBackdrop").classList.add("open"); $("#modalBackdrop").setAttribute("aria-hidden", "false"); }
function closeModal() { $("#modalBackdrop").classList.remove("open"); $("#modalBackdrop").setAttribute("aria-hidden", "true"); }

function openAddAccounts() {
  if (!requireReal()) return;
  openModal(`<h2 class="modal-title" id="modalTitle">添加监控账号</h2><p class="modal-sub">只需要公开账号用户名，不需要被监控账号登录。</p><form id="accountForm"><div class="form-grid"><label class="form-field full"><span>账号（每行一个，也支持逗号分隔）</span><textarea id="accountNames" required placeholder="@PredXOfficial\nhttps://x.com/PredXWorldCup\nPredX_CN"></textarea></label><label class="form-field"><span>负责人</span><input id="accountOwner" placeholder="可选"></label><label class="form-field"><span>团队</span><input id="accountTeam" placeholder="可选"></label><label class="form-field"><span>账号分类</span><input id="accountGroup" placeholder="产品 / 区域 / 品牌"></label><label class="form-field"><span>语言</span><input id="accountLanguage" placeholder="zh / en"></label><label class="form-field full"><span>CSV 文件</span><input id="accountCsv" type="file" accept=".csv,text/csv"><small class="form-help">读取第一列或 username 列；文件只在浏览器本地解析。</small></label></div><div class="modal-actions"><button type="button" class="secondary-button" data-close-modal>取消</button><button type="submit" class="primary-button">添加账号</button></div></form>`);
  $("#accountCsv").addEventListener("change", async event => { const file = event.target.files[0]; if (!file) return; const text = await file.text(); const lines = text.split(/\r?\n/).filter(Boolean); const header = (lines[0] || "").toLowerCase().split(","); const index = header.indexOf("username"); const values = (index >= 0 ? lines.slice(1) : lines).map(line => line.split(",")[Math.max(index, 0)]?.replace(/^"|"$/g, "").trim()).filter(Boolean); $("#accountNames").value = [$("#accountNames").value, ...values].filter(Boolean).join("\n"); });
  $("#accountForm").addEventListener("submit", async event => { event.preventDefault(); try { const result = await api("/api/accounts/batch", { method: "POST", body: JSON.stringify({ text: $("#accountNames").value, owner_name: $("#accountOwner").value || null, team_name: $("#accountTeam").value || null, account_group: $("#accountGroup").value || null, language: $("#accountLanguage").value || null }) }); closeModal(); showToast(`已添加 ${result.created.length} 个；重复 ${result.duplicates.length} 个；无效 ${result.invalid.length} 个`); await loadReal(); } catch (error) { showToast(error.message); } });
}

async function beginLogin() {
  if (!requireReal()) return;
  const active = state.setup?.session?.status === "ACTIVE";
  try { await api(active ? "/api/sessions/relogin" : "/api/sessions/login", { method: "POST" }); showToast("Chromium 已打开，请手动完成 X 登录和安全验证"); pollLogin(); } catch (error) { showToast(error.message); }
}
async function pollLogin() {
  const started = Date.now();
  const timer = setInterval(async () => { try { const session = await api("/api/sessions/status"); state.setup.session = session; renderSetup(); if (session.status === "ACTIVE") { clearInterval(timer); showToast("采集账号已登录，Session 已加密保存"); await loadReal(); } else if (Date.now() - started > 10 * 60 * 1000) { clearInterval(timer); showToast("登录等待超时，可重新点击登录采集账号"); } } catch (_) { /* temporary service errors are retried */ } }, 2000);
}

async function collectAll() {
  if (!requireReal()) return;
  try { const job = await api("/api/accounts/collect-all", { method: "POST" }); openProgress(job); } catch (error) { showToast(error.message); }
}
function openProgress(job) {
  openModal(`<h2 class="modal-title" id="modalTitle">采集全部账号</h2><p class="modal-sub">单个账号失败时会继续采集其他账号。Session 失效时任务会暂停。</p><div class="progress-list" id="progressList">${Object.entries(STEP_LABEL).map(([key, label]) => `<div class="progress-step" data-step="${key}"><i></i><b>${label}</b><span>等待中</span></div>`).join("")}</div><div class="modal-actions"><button class="secondary-button" data-close-modal>后台运行</button></div>`);
  if (state.eventSource) state.eventSource.close();
  const source = new EventSource(`/api/collection/jobs/${job.id}/events`); state.eventSource = source;
  source.onmessage = event => { const payload = JSON.parse(event.data); const row = $(`[data-step="${payload.step}"]`); if (row) { row.className = `progress-step ${payload.status.toLowerCase()}`; row.querySelector("span").textContent = payload.message || payload.status; } if (payload.step === "COMPLETE") { source.close(); showToast("采集任务已完成"); loadReal(); } };
  source.onerror = () => { source.close(); pollJob(job.id); };
}
async function pollJob(id) { try { const job = await api(`/api/collection/jobs/${id}`); if (["SUCCEEDED", "PARTIAL", "FAILED", "BLOCKED"].includes(job.status)) { showToast(`采集任务状态：${job.status}`); await loadReal(); } else setTimeout(() => pollJob(id), 2000); } catch (error) { showToast(error.message); } }

function openAccountActions(id) {
  const account = state.accounts.items.find(item => item.id === id); if (!account || state.mode !== "real") return;
  openModal(`<h2 class="modal-title" id="modalTitle">@${escapeHtml(account.username)}</h2><p class="modal-sub">修改归属信息、暂停/恢复或单独采集。删除历史数据需要二次确认。</p><form id="editAccountForm"><div class="form-grid"><label class="form-field"><span>负责人</span><input id="editOwner" value="${escapeHtml(account.owner_name || "")}"></label><label class="form-field"><span>团队</span><input id="editTeam" value="${escapeHtml(account.team_name || "")}"></label><label class="form-field"><span>账号分类</span><input id="editGroup" value="${escapeHtml(account.account_group || "")}"></label><label class="form-field"><span>语言</span><input id="editLanguage" value="${escapeHtml(account.language || "")}"></label></div><div class="modal-actions"><button type="button" class="secondary-button" id="deleteAccount">删除</button><button type="button" class="secondary-button" id="toggleAccount">${account.collection_enabled ? "暂停采集" : "恢复采集"}</button><button type="button" class="secondary-button" id="collectOne">单独采集</button><button type="submit" class="primary-button">保存</button></div></form>`);
  $("#editAccountForm").addEventListener("submit", async event => { event.preventDefault(); try { await api(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify({ owner_name: $("#editOwner").value || null, team_name: $("#editTeam").value || null, account_group: $("#editGroup").value || null, language: $("#editLanguage").value || null }) }); closeModal(); await loadReal(); } catch (error) { showToast(error.message); } });
  $("#toggleAccount").addEventListener("click", async () => { try { await api(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify({ collection_enabled: !account.collection_enabled }) }); closeModal(); await loadReal(); } catch (error) { showToast(error.message); } });
  $("#collectOne").addEventListener("click", async () => { try { const job = await api(`/api/accounts/${id}/collect`, { method: "POST" }); openProgress(job); } catch (error) { showToast(error.message); } });
  $("#deleteAccount").addEventListener("click", async () => { const removeHistory = confirm("点击“确定”将删除账号及其全部历史数据；点击“取消”只暂停账号并保留历史。是否彻底删除历史数据？"); try { await api(`/api/accounts/${id}?delete_history=${removeHistory}`, { method: "DELETE" }); closeModal(); await loadReal(); } catch (error) { showToast(error.message); } });
}

function requireReal() { if (state.mode === "real") return true; showToast("当前是演示数据模式，请先切换到真实数据"); return false; }
function exportData(kind) {
  if (state.mode === "real") { window.location.href = `/api/export/${kind === "replies" ? "external-replies" : kind}.csv`; return; }
  const rows = kind === "accounts" ? state.accounts.items : kind === "posts" ? state.posts.items : state.replies.items; const fields = Object.keys(rows[0] || { message: "demo data is empty" }); const csv = [["data_mode", "DEMO"], [], fields, ...rows.map(row => fields.map(field => row[field]))].map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv" })); link.download = `x-ops-DEMO-${kind}.csv`; link.click(); URL.revokeObjectURL(link.href);
}

function switchView(name) { const view = $(`#view-${name}`); if (!view) return; $$(".view").forEach(item => item.classList.toggle("active", item === view)); $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === name)); $("#pageTitle").textContent = view.dataset.title; history.replaceState(null, "", `#${name}`); window.scrollTo({ top: 0, behavior: "smooth" }); }

function bindEvents() {
  $$(".nav-item").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$('[data-view-jump]').forEach(button => button.addEventListener("click", () => switchView(button.dataset.viewJump)));
  $("#dataMode").addEventListener("change", async event => { state.mode = event.target.value; state.mode === "demo" ? useDemo() : await loadReal(); });
  $$(".period-tabs button").forEach(button => button.addEventListener("click", async () => { if (button.dataset.period === "custom") { showToast("当前版本支持 7、30、90 天固定区间"); return; } $$(".period-tabs button").forEach(item => item.classList.remove("active")); button.classList.add("active"); state.period = Number(button.dataset.period); state.mode === "real" ? await loadReal() : renderAll(); }));
  ["accountFilter", "ownerFilter", "teamFilter", "groupFilter", "languageFilter"].forEach(id => $("#" + id).addEventListener("change", async () => { const active = $$(".select-wrap select").filter(item => item.value !== "all").length; $("#filterCount").textContent = active; $("#filterCount").style.display = active ? "inline" : "none"; state.mode === "real" ? await loadReal() : renderOverview(); }));
  $("#moreFilters").addEventListener("click", () => showToast("可直接使用账号、负责人、团队、分类和语言筛选"));
  $("#loginCollector").addEventListener("click", beginLogin); $("#addAccount").addEventListener("click", openAddAccounts); $("#addAccountInline").addEventListener("click", openAddAccounts); $("#collectAll").addEventListener("click", collectAll);
  $("#notificationButton").addEventListener("click", () => switchView("health"));
  $("#exportButton").addEventListener("click", () => { const name = $(".view.active").id.replace("view-", ""); exportData(name === "posts" ? "posts" : name === "replies" ? "replies" : "accounts"); });
  $$('[data-export]').forEach(button => button.addEventListener("click", () => exportData(button.dataset.export)));
  $("#accountSearch").addEventListener("input", renderAccounts); $("#postSearch").addEventListener("input", renderPosts);
  $$('[data-post-filter]').forEach(button => button.addEventListener("click", () => { $$('[data-post-filter]').forEach(item => item.classList.remove("active")); button.classList.add("active"); state.postFilter = button.dataset.postFilter; renderPosts(); }));
  $("#accountTableBody").addEventListener("click", event => { const button = event.target.closest("[data-account]"); if (button) openAccountActions(button.dataset.account); });
  $("#sessionList").addEventListener("click", event => { if (event.target.closest("#healthLogin")) beginLogin(); });
  $("#jobTableBody").addEventListener("click", async event => { const button = event.target.closest("[data-retry]"); if (!button || !requireReal()) return; try { const job = await api(`/api/collection/jobs/${button.dataset.retry}/retry`, { method: "POST" }); openProgress(job); } catch (error) { showToast(error.message); } });
  $("#retryFailed").addEventListener("click", async () => { const job = (state.health?.recent_jobs || []).find(item => ["FAILED", "BLOCKED", "PARTIAL"].includes(item.status)); if (!job) { showToast("没有可重试的失败任务"); return; } try { const next = await api(`/api/collection/jobs/${job.id}/retry`, { method: "POST" }); openProgress(next); } catch (error) { showToast(error.message); } });
  $("#mockTarget").addEventListener("click", openTargetForm);
  $("#modalClose").addEventListener("click", closeModal); $("#modalBackdrop").addEventListener("click", event => { if (event.target === $("#modalBackdrop") || event.target.closest("[data-close-modal]")) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
}

bindEvents();
switchView(location.hash.slice(1) || "overview");
loadReal();
