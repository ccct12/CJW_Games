/* CJW GAMES 허브 화면 — 사용자 글은 전부 textContent 로만 넣음 (innerHTML 금지) */
(function () {
  "use strict";
  var H = window.CJWHub, T = window.CJW_T;
  var LOCALE = { ko: "ko-KR", en: "en-US", ja: "ja-JP", "zh-Hans": "zh-CN", "zh-Hant": "zh-TW" };
  var FLAG = { ko: "KO", en: "EN", ja: "JA", "zh-Hans": "简", "zh-Hant": "繁" };
  var lang = T[H.lang()] ? H.lang() : "ko";
  var THUMB_V = "2";   // 썸네일 이미지를 같은 이름으로 바꿨으면 이 숫자를 올리기 (캐시 무시)
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function t(k, vars) {
    var s = (T[lang] && T[lang][k] != null) ? T[lang][k] : (T.ko[k] != null ? T.ko[k] : k);
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace("{" + v + "}", vars[v]); });
    return s;
  }
  function errMsg(r) {
    var e = T[lang].e || T.ko.e, m = r && r.code && (e[r.code] || T.ko.e[r.code]);
    if (m) return m.replace("{left}", r.left != null ? r.left : "?");
    if (r && r.error === "busy") return e.busy;
    return (r && r.error && r.error !== "network") ? r.error : e.network;
  }

  // ───────── DOM 도우미 ─────────
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function el(tag, a, kids) {
    var n = document.createElement(tag);
    if (a) Object.keys(a).forEach(function (k) {
      var v = a[k];
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "cls") n.className = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  var toastTimer;
  function toast(msg) {
    var b = $("#toast"); b.textContent = msg; b.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { b.hidden = true; }, 2600);
  }
  function fmtTime(ms) {
    try { return new Date(ms).toLocaleString(LOCALE[lang], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return new Date(ms).toLocaleString(); }
  }
  function num(n) { return Number(n).toLocaleString(LOCALE[lang]); }
  function stars(n) { var s = ""; for (var i = 1; i <= 5; i++) s += i <= Math.round(n) ? "★" : "☆"; return s; }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  // ───────── 게임 표지 (장르와 상관없이 쓰는 범용 그림) ─────────
  function rng(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  var PALETTE = ["#ff5c8a", "#ffd23f", "#5b8cff", "#32c9a0", "#7b4dff", "#ff8a3d", "#2ec5e6"];
  var INK = "#1c1d2b";
  function pickColors(id, idx) {   // 목록 순서대로 색을 돌림 → 7개까지는 서로 다른 색
    var r = rng(id + "#"), a = ((idx || 0) * 3) % PALETTE.length, b = (a + 2 + Math.floor(r() * (PALETTE.length - 3))) % PALETTE.length;
    return [PALETTE[a], PALETTE[b], r];
  }
  // 장르 아이콘 (24×24, 선 그림)
  var GLYPH = {
    defense: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z",
    arena: "M5 4l9 9M4 9l5 5M14 13l-2 2M19 4l-9 9M20 9l-5 5M10 13l2 2M4 20l3-3M20 20l-3-3",
    rpg: "M14 4l6 0 0 6-9 9-3-3 9-9M6 15l3 3M4 20l2-2",
    action: "M13 3L5 13h6l-1 8 8-10h-6z",
    puzzle: "M5 9h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3H5v-3a2 2 0 1 0 0-4z",
    strategy: "M6 20h12M8 20v-3h8v3M9 17l-1-7h8l-1 7M8 10V6h2v2h1V6h2v2h1V6h2v4",
    casual: "M12 4l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z",
    other: "M6 9h12a3 3 0 0 1 3 3v2a3 3 0 0 1-5 2l-1-1H9l-1 1a3 3 0 0 1-5-2v-2a3 3 0 0 1 3-3zM8 11v3M6.5 12.5h3M15 12h.01M17 13.5h.01"
  };
  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, a) { var n = document.createElementNS(SVGNS, tag); Object.keys(a).forEach(function (k) { n.setAttribute(k, a[k]); }); return n; }
  function coverThumb(g, idx) {
    var c = pickColors(g.id, idx), r = c[2], s = svgEl("svg", { viewBox: "0 0 100 100", "class": "map-thumb", "aria-hidden": "true" });
    s.appendChild(svgEl("rect", { width: 100, height: 100, fill: c[0] }));
    // 뒤쪽에 큰 도형 두 개 (게임마다 위치·모양이 다름)
    for (var i = 0; i < 2; i++) {
      var x = 20 + r() * 60, y = 20 + r() * 60, z = 26 + r() * 22, k = Math.floor(r() * 3);
      var sh = k === 0 ? svgEl("circle", { cx: x, cy: y, r: z / 2 })
        : k === 1 ? svgEl("rect", { x: x - z / 2, y: y - z / 2, width: z, height: z, rx: 6, transform: "rotate(" + Math.floor(r() * 40 - 20) + " " + x + " " + y + ")" })
        : svgEl("path", { d: "M" + x + " " + (y - z / 2) + "L" + (x + z / 2) + " " + (y + z / 2) + "L" + (x - z / 2) + " " + (y + z / 2) + "Z" });
      sh.setAttribute("fill", i ? c[1] : "rgba(255,255,255,.35)"); sh.setAttribute("stroke", INK); sh.setAttribute("stroke-width", i ? 2.5 : 0);
      s.appendChild(sh);
    }
    // 가운데 흰 원 + 장르 아이콘
    s.appendChild(svgEl("circle", { cx: 50, cy: 50, r: 21, fill: "#fff", stroke: INK, "stroke-width": 2.5 }));
    var gl = svgEl("path", { d: GLYPH[g.genre] || GLYPH.other, fill: "none", stroke: INK, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round", transform: "translate(35 35) scale(1.25)" });
    s.appendChild(gl);
    return s;
  }

  // 히어로: 장난감처럼 떠다니는 도형 — 누르면 톡 터짐 (사이트의 유일한 자동 움직임)
  function startField() {
    var cv = $("#field"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), r = rng("cjw-games"), toys = [], pops = [], running = false, last = 0, acc = 0, W = 100;
    function addToy(x, y) {
      var z = 9 + r() * 9;
      toys.push({ x: x != null ? x : 12 + r() * 76, y: y != null ? y : 12 + r() * 76, z: z, vx: (r() - .5) * 14, vy: (r() - .5) * 14,
        a: r() * 6.28, va: (r() - .5) * 1.2, k: Math.floor(r() * 4), c: PALETTE[Math.floor(r() * PALETTE.length)], s: x != null ? 0 : 1 });
    }
    for (var i = 0; i < 11; i++) addToy();
    function size() {
      var w = cv.clientWidth || 118, d = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * d); cv.height = Math.round(w * d);
      ctx.setTransform(cv.width / W, 0, 0, cv.height / W, 0, 0);
    }
    function shape(t) {
      var h = t.z / 2 * t.s;
      ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.a);
      ctx.beginPath();
      if (t.k === 0) ctx.arc(0, 0, h, 0, 6.283);
      else if (t.k === 1) { var q = h * .9; ctx.moveTo(-q + 2, -q); ctx.arcTo(q, -q, q, q, 2.5); ctx.arcTo(q, q, -q, q, 2.5); ctx.arcTo(-q, q, -q, -q, 2.5); ctx.arcTo(-q, -q, q, -q, 2.5); }
      else if (t.k === 2) { ctx.moveTo(0, -h); ctx.lineTo(h * .95, h * .75); ctx.lineTo(-h * .95, h * .75); ctx.closePath(); }
      else { for (var j = 0; j < 10; j++) { var rr = j % 2 ? h * .45 : h, an = j * .628 - 1.571; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } ctx.closePath(); }
      ctx.fillStyle = t.c; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
    }
    function draw() {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, W);
      ctx.fillStyle = "#eef1fa";
      for (var gx = 5; gx < W; gx += 10) for (var gy = 5; gy < W; gy += 10) ctx.fillRect(gx - .5, gy - .5, 1, 1);
      toys.forEach(shape);
      pops.forEach(function (p) {
        ctx.strokeStyle = p.c; ctx.lineWidth = 1.5; ctx.globalAlpha = p.a;
        for (var j = 0; j < 8; j++) { var an = j * .785, d1 = 4 + (1 - p.a) * 8, d2 = d1 + 4; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(an) * d1, p.y + Math.sin(an) * d1); ctx.lineTo(p.x + Math.cos(an) * d2, p.y + Math.sin(an) * d2); ctx.stroke(); }
        ctx.globalAlpha = 1;
      });
    }
    function step(dt) {
      toys.forEach(function (t) {
        if (t.s < 1) t.s = Math.min(1, t.s + dt * 4);
        var sp = Math.sqrt(t.vx * t.vx + t.vy * t.vy);    // 너무 빠르면 천천히, 멈추면 다시 떠다니게
        if (sp > 9) { t.vx *= 1 - dt * 1.5; t.vy *= 1 - dt * 1.5; }
        if (sp < 3) { t.vx += (r() - .5) * 6 * dt * 10; t.vy += (r() - .5) * 6 * dt * 10; }
        t.x += t.vx * dt; t.y += t.vy * dt; t.a += t.va * dt;
        var h = t.z / 2;
        if (t.x < h) { t.x = h; t.vx = Math.abs(t.vx); } if (t.x > W - h) { t.x = W - h; t.vx = -Math.abs(t.vx); }
        if (t.y < h) { t.y = h; t.vy = Math.abs(t.vy); }
        if (t.y > W - h) { t.y = W - h; t.vy = -Math.abs(t.vy); }
      });
      for (var i = 0; i < toys.length; i++) for (var j = i + 1; j < toys.length; j++) {   // 서로 살짝 밀어내기
        var A = toys[i], B = toys[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.sqrt(dx * dx + dy * dy) || 1, min = (A.z + B.z) / 2 + 2;
        if (d < min) { var p = (min - d) / 2, nx = dx / d, ny = dy / d; A.x -= nx * p; A.y -= ny * p; B.x += nx * p; B.y += ny * p; A.vx -= nx * 2; A.vy -= ny * 2; B.vx += nx * 2; B.vy += ny * 2; }
      }
      pops.forEach(function (p) { p.a -= dt * 2.6; }); pops = pops.filter(function (p) { return p.a > 0; });
    }
    function frame(ts) {
      if (!running) return;
      var dt = Math.min((ts - (last || ts)) / 1000, 0.1); last = ts; acc += dt;
      if (acc >= 1 / 30) { step(acc); draw(); acc = 0; }
      requestAnimationFrame(frame);
    }
    function setRun(on) {
      if (RM) on = false;
      if (on && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      if (!on) running = false;
    }
    cv.addEventListener("pointerdown", function (e) {
      var b = cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * W, y = (e.clientY - b.top) / b.height * W, hit = -1;
      toys.forEach(function (t, i) { var dx = t.x - x, dy = t.y - y; if (dx * dx + dy * dy < Math.pow(t.z / 2 + 4, 2)) hit = i; });
      if (hit >= 0) {
        var t = toys[hit]; pops.push({ x: t.x, y: t.y, a: 1, c: t.c }); toys.splice(hit, 1);
        setTimeout(function () { addToy(15 + r() * 70, 15 + r() * 70); }, 600);
      } else { toys.forEach(function (t) { var dx = t.x - x, dy = t.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1; if (d < 35) { t.vx += dx / d * 26; t.vy += dy / d * 26; } }); }
      if (RM) draw();
    });
    size();
    for (var k = 0; k < 30; k++) step(1 / 15);
    draw();
    window.addEventListener("resize", function () { size(); draw(); });
    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; setRun(visible && !document.hidden); }).observe(cv);
    document.addEventListener("visibilitychange", function () { setRun(visible && !document.hidden); });
    setRun(true);
  }

  // ───────── 상태 ─────────
  var games = [], rating = {}, tops = {}, genre = "", rankGame = "", rankPeriod = "week", rvGame = "", rvPage = 0, rvTotal = null;

  function gname(g) { return g.name[lang] || g.name.ko || g.id; }
  function gameName(id) {
    if (id === "hub") return t("siteAll");
    for (var i = 0; i < games.length; i++) if (games[i].id === id) return gname(games[i]);
    return id;
  }

  // ───────── 언어 ─────────
  function applyLang() {
    document.documentElement.lang = lang;
    $("#lang").value = lang;
    $$("[data-t]").forEach(function (n) { n.textContent = t(n.getAttribute("data-t")); });
    renderMe(); renderBack(); renderGenres(); renderGames(); renderCont(); renderRankGames(); renderBoards(); renderRvFilter(); renderWrite(); renderCounts();
    if (latestItem) renderLatest();
  }
  $("#lang").addEventListener("change", function (e) { lang = e.target.value; H.setLang(lang); applyLang(); loadReviewsIfOpen(true); });

  // ───────── 로그인 ─────────
  function renderMe() {
    var u = H.user(), b = $("#me");
    b.textContent = u ? u.nick : t("login");
    b.classList.toggle("on", !!u);
  }
  function openLogin() {
    var d = $("#dlg-login"), f = $("#login-form");
    f.reset(); $("#login-err").hidden = true;
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
    setTimeout(function () { f.nick.focus(); }, 50);
  }
  function closeLogin() { var d = $("#dlg-login"); if (d.close) d.close(); else d.removeAttribute("open"); }
  $("#me").addEventListener("click", function () {
    if (H.user()) { if (confirm(t("logout") + "?")) { H.logout(); renderMe(); renderWrite(); renderBoards(); toast(t("loggedOut")); } }
    else openLogin();
  });
  $("#login-form").addEventListener("click", function (e) { if (e.target.value === "cancel") closeLogin(); });
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, nick = f.nick.value.trim(), pin = f.pin.value.trim(), err = $("#login-err"), btn = f.querySelector("[type=submit]");
    if (nick.length < 2 || nick.length > 12) { err.textContent = T[lang].e.nick; err.hidden = false; return; }
    if (!/^\d{6}$/.test(pin)) { err.textContent = T[lang].e.pin; err.hidden = false; return; }
    btn.disabled = true;
    H.login(nick, pin).then(function (r) {
      btn.disabled = false;
      if (!r.ok) { err.textContent = errMsg(r); err.hidden = false; return; }
      closeLogin(); renderMe(); renderWrite(); renderBoards();
      toast(t("loggedIn", { n: r.nick }));
    });
  });

  // ───────── 게임으로 돌아가기 · 이어서 하기 ─────────
  var back = "";
  try { var b = new URLSearchParams(location.search).get("back") || ""; if (/^https:\/\/ccct12\.github\.io\//.test(b)) back = b; } catch (e) {}
  function renderBack() {
    $("#back").hidden = !back;
    if (back) { $("#back-a").href = back; $("#back-a").textContent = t("backToGame"); }
  }
  function renderCont() {
    var id = ls("cjw.last"), g = null, a = $("#cont");
    games.forEach(function (x) { if (x.id === id) g = x; });
    a.hidden = !g;
    if (g) { a.href = g.url; $("#cont-n").textContent = gname(g); a.onclick = function () { ls("cjw.last", g.id); }; }
  }

  // ───────── 공지 ─────────
  function loadNotice() {
    H.notices().then(function (r) {
      var box = $("#notice"); clear(box);
      if (!r.ok || !r.ads || !r.ads.length) { box.hidden = true; return; }
      var a = r.ads[0];
      if (a.who) box.appendChild(el("b", { text: a.who }));
      box.appendChild(a.link ? el("a", { href: a.link, target: "_blank", rel: "noopener", text: a.text }) : el("span", { text: a.text }));
      box.hidden = false;
    });
  }

  // ───────── 게임 목록 ─────────
  function tagName(kind, code) { var m = (T[lang][kind] || T.ko[kind] || {}); return m[code] || (T.ko[kind] || {})[code] || code; }
  function renderGenres() {
    var box = $("#genres"); clear(box);
    var seen = {}, list = [];
    games.forEach(function (g) { if (g.genre && !seen[g.genre]) { seen[g.genre] = 1; list.push(g.genre); } });
    box.hidden = list.length < 2;
    if (list.length < 2) { genre = ""; return; }
    [""].concat(list).forEach(function (code) {
      box.appendChild(el("button", { type: "button", "aria-pressed": code === genre ? "true" : "false", text: code ? tagName("g", code) : t("genreAll"),
        onclick: function () { genre = code; renderGenres(); renderGames(); } }));
    });
  }
  function renderGames() {
    var box = $("#game-list"); clear(box);
    if (!games.length) { box.appendChild(el("li", { cls: "map skel" })); box.appendChild(el("li", { cls: "map skel" })); return; }
    games.filter(function (g) { return !genre || g.genre === genre; }).forEach(function (g) {
      var rt = rating[g.id], top = tops[g.id] && tops[g.id].week && tops[g.id].week[0];
      var url = /^https:\/\//.test(g.url) ? g.url : "#";
      var thumb;
      if (g.thumb && /^https:\/\//.test(g.thumb)) thumb = el("img", { cls: "map-thumb", src: g.thumb + (g.thumb.indexOf("?") < 0 ? "?v=" + THUMB_V : ""), alt: "", loading: "lazy" });
      else thumb = coverThumb(g, games.indexOf(g));
      box.appendChild(el("li", { cls: "map" }, [
        thumb,
        el("div", { cls: "map-info" }, [
          (g.genre || g.origin) ? el("div", { cls: "tags" }, [
            g.origin ? el("span", { cls: "tag o", text: tagName("o", g.origin) }) : null,
            g.genre ? el("span", { cls: "tag", text: tagName("g", g.genre) }) : null
          ]) : null,
          el("h2", { cls: "map-name", text: gname(g) }),
          el("div", { cls: "map-meta" }, rt ? [
            el("span", { cls: "star", text: stars(rt.avg), "aria-label": rt.avg + "/5" }),
            el("span", { text: rt.avg.toFixed(1) }),
            el("span", { text: t("reviewsN", { n: rt.n }) })
          ] : [el("span", { text: t("noRating") })])
        ]),
        el("div", { cls: "map-top" }, tops[g.id] ? (top ? [
          el("span", { text: t("weeklyTop") }), el("b", { text: top.nick }), el("span", { cls: "sc", text: num(top.score) })
        ] : [el("span", { text: t("noTop") })]) : []),
        el("div", { cls: "map-act" }, [
          el("a", { cls: "btn", href: url, text: t("play"), onclick: function () { ls("cjw.last", g.id); } }),
          el("button", { cls: "btn ghost", type: "button", text: t("rank"), onclick: function () { rankGame = g.id; location.hash = "#rank"; } })
        ])
      ]));
    });
  }
  function renderCounts() {
    $("#nav-games-n").textContent = games.length ? String(games.length) : "";
    $("#nav-rv-n").textContent = rvTotal ? String(rvTotal) : "";
  }
  function loadGames() {
    renderGames();
    return H.games().then(function (r) {
      if (!r.ok) { clear($("#game-list")); $("#game-list").appendChild(el("li", { cls: "empty", text: errMsg(r) })); return; }
      games = r.games || []; rating = r.rating || {};
      if (!rankGame && games[0]) rankGame = games[0].id;
      renderGenres(); renderGames(); renderCont(); renderRankGames(); renderRvFilter(); renderWrite(); renderCounts();
      games.forEach(function (g) {
        H.top(g.id, "normal").then(function (x) { if (x.ok) { tops[g.id] = x; renderGames(); if (g.id === rankGame) renderBoards(); } });
      });
    });
  }

  // ───────── 최신 후기 한 줄 ─────────
  var latestItem = null;
  function renderLatest() {
    var box = $("#latest-body"); clear(box);
    if (!latestItem) { $("#latest").hidden = true; return; }
    box.appendChild(reviewItem(latestItem, true)); $("#latest").hidden = false;
  }
  function loadLatest() {
    H.reviews("", 0).then(function (r) {
      if (!r.ok) return;
      rvTotal = r.total; renderCounts();
      latestItem = r.reviews[0] || null; renderLatest();
    });
  }

  // ───────── 랭킹 ─────────
  function renderRankGames() {
    var box = $("#rank-games"); clear(box);
    games.forEach(function (g) {
      box.appendChild(el("button", { type: "button", role: "tab", "aria-selected": g.id === rankGame ? "true" : "false", text: gname(g),
        onclick: function () { rankGame = g.id; renderRankGames(); loadRank(); } }));
    });
    $$(".seg button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-period") === rankPeriod ? "true" : "false"); });
    $$(".board").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-board") === rankPeriod); });
  }
  $$(".seg button").forEach(function (b) {
    b.addEventListener("click", function () { rankPeriod = b.getAttribute("data-period"); renderRankGames(); });
  });
  function renderBoards() {
    var r = tops[rankGame], me = (H.user() || {}).nick;
    ["week", "all"].forEach(function (p) {
      var list = $("#rank-" + p); clear(list);
      if (!r) { list.appendChild(el("li", { cls: "empty", text: "…" })); return; }
      var rows = r[p] || [];
      if (!rows.length) { list.appendChild(el("li", { cls: "empty", text: t("noRecords") })); return; }
      rows.forEach(function (x, i) {
        list.appendChild(el("li", { cls: x.nick === me ? "mine" : "" }, [
          el("span", { cls: "no", text: String(i + 1) }),
          el("span", { cls: "nm", text: x.nick, "data-you": t("you") }),
          el("span", { cls: "sc", text: num(x.score) })
        ]));
      });
    });
  }
  var rankAt = {};
  function loadRank() {
    renderBoards();
    if (!rankGame || (rankAt[rankGame] && Date.now() - rankAt[rankGame] < 60000)) return;
    var g = rankGame;
    H.top(g, "normal").then(function (r) { if (r.ok) { tops[g] = r; rankAt[g] = Date.now(); } if (g === rankGame) renderBoards(); renderGames(); });
  }

  // ───────── 후기 ─────────
  function renderRvFilter() {
    var s = $("#rv-filter"); clear(s);
    s.appendChild(el("option", { value: "", text: t("filterAll") }));
    games.forEach(function (g) { s.appendChild(el("option", { value: g.id, text: gname(g) })); });
    s.appendChild(el("option", { value: "hub", text: t("siteAll") }));
    s.value = rvGame;
  }
  $("#rv-filter").addEventListener("change", function (e) { rvGame = e.target.value; rvPage = 0; loadReviews(); });
  $("#rv-open").addEventListener("click", function () {
    var w = $("#rv-write"), open = !w.classList.contains("open");
    w.classList.toggle("open", open);
    if (open) { w.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" }); var f = w.querySelector("textarea,button"); if (f) f.focus({ preventScroll: true }); }
  });

  function renderWrite() {
    var box = $("#rv-write"); clear(box);
    box.appendChild(el("h3", { text: t("writeTitle") }));
    var u = H.user();
    if (!u) {
      box.appendChild(el("p", { cls: "hint", text: t("writeNeedLogin") }));
      box.appendChild(el("button", { cls: "btn wide", type: "button", text: t("login"), onclick: openLogin }));
      return;
    }
    var next = Number(ls("cjw.rvNext." + u.nick) || 0);
    if (next > Date.now()) { box.appendChild(el("p", { cls: "hint", text: t("nextAt", { t: fmtTime(next) }) })); return; }
    var sel = el("select", { "aria-label": t("reviewGame") });
    games.forEach(function (g) { sel.appendChild(el("option", { value: g.id, text: gname(g) })); });
    sel.appendChild(el("option", { value: "hub", text: t("siteAll") }));
    if (rvGame) sel.value = rvGame;
    var pick = 0, sp = el("div", { cls: "starpick", role: "radiogroup", "aria-label": "★" });
    for (var i = 1; i <= 5; i++) (function (n) {
      sp.appendChild(el("button", { type: "button", role: "radio", "aria-checked": "false", "aria-label": n + "/5", text: "★", onclick: function () {
        pick = n; $$("#rv-write .starpick button").forEach(function (b, j) { b.classList.toggle("on", j < n); b.setAttribute("aria-checked", j === n - 1 ? "true" : "false"); });
      } }));
    })(i);
    var ta = el("textarea", { rows: "4", maxlength: "200", placeholder: t("reviewPh") });
    var cnt = el("div", { cls: "count", text: "0/200" });
    ta.addEventListener("input", function () { cnt.textContent = ta.value.length + "/200"; });
    var err = el("p", { cls: "err", hidden: true });
    var btn = el("button", { cls: "btn wide", type: "button", text: t("post") });
    btn.addEventListener("click", function () {
      err.hidden = true;
      if (!pick) { err.textContent = T[lang].e.stars; err.hidden = false; return; }
      if (ta.value.trim().length < 2) { err.textContent = T[lang].e.text; err.hidden = false; return; }
      btn.disabled = true;
      H.review({ game: sel.value, stars: pick, text: ta.value.trim() }).then(function (r) {
        btn.disabled = false;
        if (r.code === "gap" && r.next) ls("cjw.rvNext." + u.nick, String(r.next));
        if (!r.ok) {
          err.textContent = errMsg(r); err.hidden = false;
          if (r.code === "auth") { renderMe(); renderWrite(); }
          return;
        }
        ls("cjw.rvNext." + u.nick, String(Date.now() + 24 * 3600000));
        toast(t("posted")); renderWrite(); rvPage = 0; loadReviews(); loadLatest();
      });
    });
    box.appendChild(el("div", { cls: "row" }, [sel]));
    box.appendChild(sp); box.appendChild(ta); box.appendChild(cnt); box.appendChild(err); box.appendChild(btn);
  }

  function reviewItem(x, compact) {
    var li = el(compact ? "div" : "li", { cls: "rv" });
    if (!compact) {
      var rep = el("button", { cls: "rv-x", type: "button", text: t("report"), onclick: function () {
        if (!confirm(t("reportAsk"))) return;
        rep.disabled = true;
        H.report(x.id).then(function (r) { rep.textContent = r.ok ? t("reported") : errMsg(r); if (r.hidden) li.remove(); });
      } });
      li.appendChild(rep);
    }
    li.appendChild(el("div", { cls: "rv-h" }, [
      el("span", { cls: "who", text: x.nick }),
      el("span", { cls: "star", text: stars(x.stars), "aria-label": x.stars + "/5" }),
      el("span", { cls: "game", text: gameName(x.game) }),
      el("span", { text: fmtTime(x.t) }),
      el("span", { text: FLAG[x.lang] || "" })
    ]));
    li.appendChild(el("p", { cls: "rv-t", text: x.text }));
    if (x.reply && !compact) li.appendChild(el("div", { cls: "rv-r" }, [el("b", { text: t("reply") }), document.createTextNode(x.reply)]));
    return li;
  }
  function loadReviews() {
    var list = $("#rv-list"), more = $("#rv-more");
    if (rvPage === 0) { clear(list); list.appendChild(el("li", { cls: "empty", text: "…" })); }
    more.hidden = true;
    H.reviews(rvGame, rvPage).then(function (r) {
      if (rvPage === 0) clear(list);
      if (!r.ok) { list.appendChild(el("li", { cls: "empty", text: errMsg(r) })); return; }
      if (!rvGame) { rvTotal = r.total; renderCounts(); }
      if (!r.reviews.length && rvPage === 0) list.appendChild(el("li", { cls: "empty", text: t("noReviews") }));
      r.reviews.forEach(function (x) { list.appendChild(reviewItem(x)); });
      more.hidden = !r.more;
    });
  }
  function loadReviewsIfOpen(force) { if (loaded.reviews || force) { if (view === "reviews") { rvPage = 0; loadReviews(); } } }
  $("#rv-more").addEventListener("click", function () { rvPage++; loadReviews(); });

  // ───────── 요청 ─────────
  $("#rq-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, btn = f.querySelector("[type=submit]"), msg = f.msg.value.trim();
    if (msg.length < 2) { toast(T[lang].e.text); f.msg.focus(); return; }
    btn.disabled = true;
    var kind = (f.querySelector("input[name=kind]:checked") || {}).value || "기타";
    H.request({ kind: kind, game: f.game.value.trim(), msg: msg, hp: f.hp.value }).then(function (r) {
      btn.disabled = false;
      if (!r.ok) { toast(errMsg(r)); return; }
      f.reset(); toast(t("sent"));
    });
  });

  // ───────── 화면 전환 (#주소) ─────────
  var loaded = {}, view = "games";
  function route() {
    var h = (location.hash || "#games").slice(1);
    if (h === "login") { h = "games"; if (!H.user()) setTimeout(openLogin, 0); }
    if (["games", "rank", "reviews", "request"].indexOf(h) < 0) h = "games";
    view = h; document.body.setAttribute("data-view", h);
    $$(".view").forEach(function (v) { v.hidden = v.id !== "v-" + h; });
    $$("[data-tab]").forEach(function (a) {
      var on = a.getAttribute("data-tab") === h;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (h === "rank") { renderRankGames(); loadRank(); }
    if (h === "reviews" && !loaded.reviews) { loaded.reviews = 1; loadReviews(); }
    if (window.matchMedia("(max-width: 959px)").matches) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // ───────── 시작 ─────────
  applyLang();
  route();
  startField();
  loadGames();
  loadNotice();
  loadLatest();
  H.visit("hub");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
