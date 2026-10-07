/* ============================================================
   异想纪元·熵寂录 —— 百科站引擎
   职责：生成导航/侧边栏/页脚；按页渲染栏目列表、检索、详情弹窗。
   页面只需：<body data-page="index|collection|lore|characters|places|bestiary|combat|story">
   ============================================================ */
(function () {
  "use strict";

  const PAGE = document.body.dataset.page || "index";

  /* 把 \n 转成 <br>，让名字/摘要里也能换行 */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

  /* ---------- 单栏目背景（可选，配置见 data.js 的 SITE.bg） ---------- */
  (function applyBg() {
    const map = SITE.bg || {};
    const img = map[PAGE];
    if (!img) return;                       // 未配置 → 用 CSS 里的全局默认
    document.body.style.setProperty("--bg-image", `url('${img}')`);
    if (map.shade) document.body.style.setProperty("--bg-shade", map.shade);
  })();

  /* ---------- 公共骨架：导航 + 侧边栏 + 遮罩 ---------- */
  function buildChrome() {
    const nav = document.createElement("nav");
    nav.className = "navbar";
    nav.innerHTML =
      `<div class="menu-btn" id="menuBtn"><span></span><span></span><span></span></div>
       <a class="logo" href="index.html" style="text-decoration:none;">异想纪元<span> · 熵寂录</span></a>`;

    const side = document.createElement("aside");
    side.className = "sidebar";
    side.id = "sidebar";
    side.innerHTML =
      `<div class="sidebar-header">
          <div class="sidebar-logo">TEOH-Wiki</div>
          <div class="close-btn" id="closeBtn">&times;</div>
       </div>
       <ul class="sidebar-nav">
          <li><a href="index.html"${PAGE === "index" ? ' class="active"' : ""}>首页</a></li>
          ${SECTIONS.map(s =>
            `<li><a href="${s.key}.html"${PAGE === s.key ? ' class="active"' : ""}>${s.name}</a></li>`
          ).join("")}
       </ul>
       <div class="sidebar-bottom">
          <img class="wiki-mark" src="${SITE.sidebarImg}" alt="TEOH-Wiki"
               onerror="this.style.display='none'">
          <div class="sidebar-foot">
             服务器号：${SITE.server}<br>QQ群：${SITE.qq}
          </div>
       </div>`;

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "overlay";

    document.body.insertBefore(overlay, document.body.firstChild);
    document.body.insertBefore(side, document.body.firstChild);
    document.body.insertBefore(nav, document.body.firstChild);

    const open  = () => { side.classList.add("open");  overlay.classList.add("show"); };
    const close = () => { side.classList.remove("open"); overlay.classList.remove("show"); };
    nav.querySelector("#menuBtn").onclick = open;
    side.querySelector("#closeBtn").onclick = close;
    overlay.onclick = close;
  }

  /* ---------- 页脚 ---------- */
  function buildFoot() {
    const f = document.createElement("footer");
    f.className = "site-foot";
    f.innerHTML =
      `<div class="sf-line">${SITE.title} · ${SITE.subtitle}</div>
       <div>${SITE.version} ｜ 服务器号 ${SITE.server} ｜ QQ群 ${SITE.qq}</div>
       <div style="opacity:.6;">本页为提欧百科，内容随开发迭代更新</div>`;
    document.body.appendChild(f);
  }

  /* ---------- 详情弹窗 ---------- */
  let modal;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "detail-modal";
    modal.innerHTML =
      `<div class="detail-inner">
          <div class="detail-head">
             <div>
                <div class="detail-title" id="dmTitle"></div>
                <div class="detail-meta"  id="dmMeta"></div>
             </div>
             <span class="detail-close" id="dmClose">&times;</span>
          </div>
          <div class="detail-body" id="dmBody"></div>
       </div>`;
    document.body.appendChild(modal);
    modal.querySelector("#dmClose").onclick = () => modal.classList.remove("open");
    modal.onclick = e => { if (e.target === modal) modal.classList.remove("open"); };
    return modal;
  }
  function openDetail(entry) {
    const m = ensureModal();
    m.querySelector("#dmTitle").innerHTML = nl2br(entry.name);
    m.querySelector("#dmMeta").textContent =
      `${(entry.series || "")}${entry.no && entry.no !== "—" ? "　·　" + entry.no : ""}${entry.spoiler ? "　·　【含剧透】" : ""}`;
    m.querySelector("#dmBody").textContent = entry.body || "（暂无正文）";
    m.classList.add("open");
    m.querySelector(".detail-inner").scrollTop = 0;
  }

  /* ---------- 首页 ---------- */
  function renderIndex() {
    const main = document.querySelector("main");
    main.innerHTML =
      `<section class="section hero">
          <h1 class="hero-title">${SITE.title}</h1>
          <div class="hero-sub"><span>${SITE.version}</span><span>${SITE.subtitle}</span></div>
          <p class="hero-desc">${SITE.desc}</p>
          <div style="margin-top:1.8rem;"><a class="btn" href="collection.html">进入百科</a></div>
       </section>
       <section class="section">
          <div class="section-header">
             <h2 class="main-title">栏目</h2>
             <p class="sub-title">CATEGORIES <span class="arrow">↘</span></p>
          </div>
          <div class="cat-grid">
             ${SECTIONS.map(s => {
                const n = (ENTRIES[s.key] || []).length;
                return `<a class="cat-card card" href="${s.key}.html">
                          <span class="cat-count">${n} 条</span>
                          <span class="cat-en">${s.en}</span>
                          <div class="cat-name">${s.name}</div>
                          <div class="cat-desc">${s.desc}</div>
                        </a>`;
             }).join("")}
          </div>
       </section>`;
  }

  /* ---------- 栏目页 ---------- */
  function renderList(key) {
    const sec   = SECTIONS.find(s => s.key === key) || { name: key, en: key.toUpperCase(), desc: "" };
    const items = ENTRIES[key] || [];
    const main  = document.querySelector("main");

    main.innerHTML =
      `<section class="section">
          <div class="section-header">
             <h2 class="main-title">${sec.name}</h2>
             <p class="sub-title">${sec.en} <span class="arrow">↘</span></p>
             ${sec.desc ? `<p style="color:var(--text-dim);font-size:.88rem;margin-top:.5rem;">${sec.desc}</p>` : ""}
          </div>
          <div class="search-box"><input id="kw" type="text" placeholder="检索${sec.name}…（名称 / 编号 / 摘要）"></div>
          <div class="chip-row" id="chips"></div>
          <div class="entry-grid" id="grid"></div>
       </section>`;

    const grid = main.querySelector("#grid");
    const chipRow = main.querySelector("#chips");
    const kw = main.querySelector("#kw");

    // 分类（series）
    const seriesList = ["全部", ...new Set(items.map(i => i.series).filter(Boolean))];
    let curSeries = "全部";

    seriesList.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " active" : "");
      b.textContent = s;
      b.onclick = () => {
        chipRow.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        b.classList.add("active");
        curSeries = s;
        draw();
      };
      chipRow.appendChild(b);
    });

    function draw() {
      const q = (kw.value || "").trim().toLowerCase();
      const list = items.filter(i =>
        (curSeries === "全部" || i.series === curSeries) &&
        (!q || (i.name + i.no + i.sub + (i.body || "")).toLowerCase().includes(q))
      );
      grid.innerHTML = "";
      if (!list.length) { grid.innerHTML = `<div class="empty-tip">没有匹配的条目。</div>`; return; }
      list.forEach(i => {
        const locked = (i.body || "").startsWith("【待补") || (i.body || "").startsWith("【正文见");
        const bg = i.img ? `<div class="card-bg" style="background-image:url('${i.img}')"></div>` : "";
        const c = document.createElement("div");
        c.className = "card entry-card" + (locked ? " locked" : "");
        c.innerHTML =
          bg +
          `<span class="e-no">${esc(i.no || "")}</span>
           <span class="e-tag">${esc(i.series || "")}${i.spoiler ? " · 剧透" : ""}</span>
           <div>
              <div class="e-name">${nl2br(i.name)}</div>
              <div class="e-sub">${nl2br(i.sub || "")}</div>
           </div>`;
        c.onclick = () => openDetail(i);
        grid.appendChild(c);
      });
      if (window.AOS) AOS.refresh();
    }
    kw.addEventListener("input", draw);
    draw();
  }

  /* ---------- 首页 → 藏品：不规则方块乱码转场 ----------
     要点：方块大小随机 + 位置抖动 + 随机缺口 + 波前噪声 → 扩散前沿是毛边碎块状 */
  const GLITCH_BORDERS = ["rgba(69,200,255,.55)", "rgba(62,207,207,.5)", "rgba(90,170,255,.5)", "rgba(120,150,255,.45)"];

  function buildVeil() {
    const STEP   = 30;       // 网格步长(px)：越小方块越多越细
    const JITTER = 9;        // 位置抖动(px)：打破网格规整感
    const SPREAD = 900;      // 中心扩散到角落的基准时长(ms)
    const GAP    = 0.28;     // 随机缺口比例（越大越稀疏破碎）

    const cols = Math.ceil(window.innerWidth  / STEP);
    const rows = Math.ceil(window.innerHeight / STEP);
    const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
    const maxD = Math.hypot(cx, cy) || 1;

    const veil = document.createElement("div");
    veil.id = "glitch-veil";
    const base = document.createElement("div");           // 兜底暗底：最后合拢，保证全覆盖
    base.className = "g-base";
    veil.appendChild(base);

    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < GAP) continue;                // 随机留缺口

        const ratio = Math.hypot(c - cx, r - cy) / maxD;
        // 波前噪声：让前沿参差（有超前、有滞后），不再是完美圆
        let delay = ratio * SPREAD + (Math.random() - 0.45) * SPREAD * 0.6;
        if (Math.random() < 0.07) delay *= 1.6;           // 少量“掉队”方块
        delay = Math.max(0, delay);

        const size = STEP * (0.7 + Math.random() * 1.6);  // 大小不一
        const dx = c - cx, dy = r - cy, len = Math.hypot(dx, dy) || 1;
        const off = 14 + Math.random() * 12;              // 入场时向内飞的距离

        const b = document.createElement("span");
        b.className = "g-blk";
        b.style.left   = (c * STEP + (Math.random() - 0.5) * JITTER * 2) + "px";
        b.style.top    = (r * STEP + (Math.random() - 0.5) * JITTER * 2) + "px";
        b.style.width  = size.toFixed(0) + "px";
        b.style.height = size.toFixed(0) + "px";
        b.style.setProperty("--d",  delay.toFixed(0));
        b.style.setProperty("--o",  (0.45 + Math.random() * 0.55).toFixed(2));
        b.style.setProperty("--tx", (dx / len * off).toFixed(1) + "px");
        b.style.setProperty("--ty", (dy / len * off).toFixed(1) + "px");

        const bc = GLITCH_BORDERS[(Math.random() * GLITCH_BORDERS.length) | 0];
        b.style.borderColor = bc;
        if (Math.random() < 0.16) b.style.boxShadow = `0 0 8px ${bc}`;
        frag.appendChild(b);
      }
    }
    veil.appendChild(frag);
    return veil;
  }

  function glitchNavigate(url) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { location.href = url; return; }
    const veil = buildVeil();
    document.body.appendChild(veil);
    veil.getBoundingClientRect();                         // 强制回流，保证过渡生效
    veil.classList.add("cover");                          // 碎块由中心向外涌出覆盖
    try { sessionStorage.setItem("teoh-glitch", "1"); } catch (e) {}
    setTimeout(() => { location.href = url; }, 1150);
  }

  function glitchReveal() {
    const veil = buildVeil();
    veil.classList.add("cover");                          // 首帧即全覆盖（不触发过渡）
    document.body.appendChild(veil);
    setTimeout(() => {
      veil.classList.remove("cover");                     // 碎块由中心向外消散，露出藏品页
      setTimeout(() => {
        veil.remove();
        try { sessionStorage.removeItem("teoh-glitch"); } catch (e) {}
      }, 1800);
    }, 200);
  }

  /* ---------- 启动 ---------- */
  buildChrome();
  if (PAGE === "index") renderIndex();
  else                   renderList(PAGE);
  buildFoot();

  /* 首页：所有指向 collection.html 的链接（进入百科按钮/栏目卡/侧边栏）统一接管 */
  if (PAGE === "index") {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href="collection.html"]');
      if (a) { e.preventDefault(); glitchNavigate(a.getAttribute("href")); }
    });
  }
  /* 藏品页：若由首页乱码转场而来，则播放消散入场 */
  if (PAGE === "collection") {
    try { if (sessionStorage.getItem("teoh-glitch") === "1") glitchReveal(); } catch (e) {}
  }

  if (window.AOS) AOS.init({ duration: 600, once: true });
})();
