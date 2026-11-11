/* CJW GAMES 허브 화면 — 사용자 글은 전부 textContent 로만 넣음 (innerHTML 금지) */
(function () {
  "use strict";
  var H = window.CJWHub, T = window.CJW_T;
  var LOCALE = { ko: "ko-KR", en: "en-US", ja: "ja-JP", "zh-Hans": "zh-CN", "zh-Hant": "zh-TW" };
  var FLAG = { ko: "KO", en: "EN", ja: "JA", "zh-Hans": "简", "zh-Hant": "繁" };
  var lang = T[H.lang()] ? H.lang() : "ko";
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

  // ───────── 맵 그림 (게임마다 다른 미니맵, 직접 생성) ─────────
  function rng(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  function hue(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; }
  /** 100×100 좌표: 바깥 흙길 고리 + 가운데 타워 자리 */
  function mapModel(id) {
    var r = rng(id), towers = [], P = 17;
    var n = 7 + Math.floor(r() * 5);
    for (var i = 0; i < n; i++) {
      var x = 30 + Math.floor(r() * 9) * 5, y = 30 + Math.floor(r() * 9) * 5, dup = false;
      for (var j = 0; j < towers.length; j++) if (towers[j].x === x && towers[j].y === y) dup = true;
      if (!dup) towers.push({ x: x, y: y, k: r() < .3 ? 1 : 0, cd: r() * 1.2 });
    }
    return { P: P, towers: towers, h: hue(id), gate: Math.floor(r() * 4) };
  }
  function loopPoint(m, t) {          // t: 0~1, 고리 길을 따라 한 바퀴
    var a = m.P, b = 100 - m.P, L = b - a, d = ((t % 1) + 1) % 1 * L * 4, side = Math.floor(d / L), o = d - side * L;
    side = (side + m.gate) % 4;
    if (side === 0) return [a + o, a];
    if (side === 1) return [b, a + o];
    if (side === 2) return [b - o, b];
    return [a, b - o];
  }
  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, a) { var n = document.createElementNS(SVGNS, tag); Object.keys(a).forEach(function (k) { n.setAttribute(k, a[k]); }); return n; }
  function mapThumb(id) {
    var m = mapModel(id), s = svgEl("svg", { viewBox: "0 0 100 100", "class": "map-thumb", "aria-hidden": "true" });
    s.appendChild(svgEl("rect", { width: 100, height: 100, fill: "hsl(" + ((m.h + 140) % 360) + ",18%,19%)" }));
    s.appendChild(svgEl("rect", { x: m.P, y: m.P, width: 100 - 2 * m.P, height: 100 - 2 * m.P, fill: "none", stroke: "#a88a5c", "stroke-width": 9, "stroke-linejoin": "round", opacity: .9 }));
    s.appendChild(svgEl("rect", { x: 26, y: 26, width: 48, height: 48, fill: "rgba(255,255,255,.04)" }));
    m.towers.forEach(function (tw) {
      s.appendChild(svgEl("rect", { x: tw.x - 3, y: tw.y - 3, width: 6, height: 6, rx: 1, fill: tw.k ? "#6ea0d8" : "hsl(" + m.h + ",62%,60%)" }));
    });
    var g = loopPoint(m, 0);
    s.appendChild(svgEl("circle", { cx: g[0], cy: g[1], r: 4.5, fill: "#d0553f" }));
    return s;
  }

  // 히어로: 고리 길을 도는 몬스터와 타워 (유일한 자동 움직임)
  function startField() {
    var cv = $("#field"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), m = mapModel("cjw-games"), creeps = [], shots = [], bursts = [], running = false, last = 0, acc = 0;
    for (var i = 0; i < 18; i++) creeps.push({ t: -i * 0.05, hp: 7 });
    function size() {
      var w = cv.clientWidth || 128, d = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * d); cv.height = Math.round(w * d);
      ctx.setTransform(cv.width / 100, 0, 0, cv.height / 100, 0, 0);
    }
    var r2 = rng("ground"), specks = [];
    for (var q = 0; q < 46; q++) specks.push([Math.floor(r2() * 25) * 4, Math.floor(r2() * 25) * 4, r2() < .5]);
    function draw() {
      ctx.fillStyle = "#26352d"; ctx.fillRect(0, 0, 100, 100);
      specks.forEach(function (s) { ctx.fillStyle = s[2] ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.08)"; ctx.fillRect(s[0], s[1], 4, 4); });
      ctx.strokeStyle = "#a88a5c"; ctx.lineWidth = 9; ctx.lineJoin = "round"; ctx.globalAlpha = .85;
      ctx.strokeRect(m.P, m.P, 100 - 2 * m.P, 100 - 2 * m.P); ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,.035)"; ctx.fillRect(26, 26, 48, 48);
      m.towers.forEach(function (tw) { ctx.fillStyle = tw.k ? "#6ea0d8" : "#e2b84a"; ctx.fillRect(tw.x - 2.6, tw.y - 2.6, 5.2, 5.2); });
      shots.forEach(function (s) { ctx.strokeStyle = s.k ? "rgba(110,160,216," + s.a + ")" : "rgba(226,184,74," + s.a + ")"; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke(); });
      creeps.forEach(function (c) {
        if (c.t < 0) return;
        var p = loopPoint(m, c.t); ctx.fillStyle = c.hit > 0 ? "#ece4d0" : "#d0553f";
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.3, 0, 6.283); ctx.fill();
      });
      bursts.forEach(function (b) { ctx.strokeStyle = "rgba(236,228,208," + b.a + ")"; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(b.x, b.y, 2 + (1 - b.a) * 5, 0, 6.283); ctx.stroke(); });
    }
    function step(dt) {
      creeps.forEach(function (c) { c.t += dt * 0.05; if (c.hit > 0) c.hit -= dt; });
      m.towers.forEach(function (tw) {
        tw.cd -= dt; if (tw.cd > 0) return;
        var best = null, bd = 30 * 30;
        creeps.forEach(function (c) { if (c.t < 0) return; var p = loopPoint(m, c.t), dx = p[0] - tw.x, dy = p[1] - tw.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = c; } });
        tw.cd = tw.k ? 1.6 : 0.9;
        if (!best) return;
        var p = loopPoint(m, best.t);
        shots.push({ x1: tw.x, y1: tw.y, x2: p[0], y2: p[1], a: 1, k: tw.k });
        best.hit = .08; best.hp -= tw.k ? 2 : 1;
        if (best.hp <= 0) { bursts.push({ x: p[0], y: p[1], a: 1 }); best.t = -0.1 - Math.random() * .25; best.hp = 7; }
      });
      shots.forEach(function (s) { s.a -= dt * 7; }); shots = shots.filter(function (s) { return s.a > 0; });
      bursts.forEach(function (b) { b.a -= dt * 2.5; }); bursts = bursts.filter(function (b) { return b.a > 0; });
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
    size();
    for (var k = 0; k < 160; k++) step(1 / 15);   // 첫 화면부터 몬스터가 길 위에 있게
    draw();
    window.addEventListener("resize", function () { size(); draw(); });
    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; setRun(visible && !document.hidden); }).observe(cv);
    document.addEventListener("visibilitychange", function () { setRun(visible && !document.hidden); });
    setRun(true);
  }

  // ───────── 상태 ─────────
  var games = [], rating = {}, tops = {}, rankGame = "", rankPeriod = "week", rvGame = "", rvPage = 0, rvTotal = null;

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
    renderMe(); renderBack(); renderGames(); renderCont(); renderRankGames(); renderBoards(); renderRvFilter(); renderWrite(); renderCounts();
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
  function renderGames() {
    var box = $("#game-list"); clear(box);
    if (!games.length) { box.appendChild(el("li", { cls: "map skel" })); box.appendChild(el("li", { cls: "map skel" })); return; }
    games.forEach(function (g) {
      var rt = rating[g.id], top = tops[g.id] && tops[g.id].week && tops[g.id].week[0];
      var url = /^https:\/\//.test(g.url) ? g.url : "#";
      var thumb;
      if (g.thumb && /^https:\/\//.test(g.thumb)) thumb = el("img", { cls: "map-thumb", src: g.thumb, alt: "", loading: "lazy" });
      else thumb = mapThumb(g.id);
      box.appendChild(el("li", { cls: "map" }, [
        thumb,
        el("div", { cls: "map-info" }, [
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
      renderGames(); renderCont(); renderRankGames(); renderRvFilter(); renderWrite(); renderCounts();
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
    if (open) { var f = w.querySelector("textarea,button"); if (f) f.focus(); }
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
