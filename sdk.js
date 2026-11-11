/*!
 * CJW 게임 허브 SDK v1 — 허브와 모든 게임이 같이 쓰는 작은 연결 코드
 *
 * 게임에서 쓰는 법 (index.html 맨 아래):
 *   <script src="https://ccct12.github.io/CJW-Games/sdk.js"></script>
 *   <script>
 *     CJWHub.visit("nrd");                          // 게임 열 때 1번 (방문 기록)
 *     // 판이 끝나면:
 *     CJWHub.submitScore({ game: "nrd", mode: "normal", score: 123456, gid: CJWHub.newGameId(), ver: "1.0.3" })
 *       .then(function (r) { if (r.code === "auth") CJWHub.openHub("login"); });
 *   </script>
 *
 * 로그인 정보(닉네임·토큰)와 방문자ID는 ccct12.github.io 안의 모든 페이지가 같이 씁니다.
 */
(function (root) {
  "use strict";
  var API = "https://script.google.com/macros/s/AKfycbz1u8Fc1BiieqSkNWNLq4OkS9_b47lA0XDzkUucsOYQp525xx5Byj175zn77FSb-GWp6w/exec";
  var HUB_URL = "https://ccct12.github.io/CJW-Games/";
  var K = { vid: "cjw.vid", nick: "cjw.nick", token: "cjw.token", exp: "cjw.exp", lang: "cjw.lang" };

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  function rid(n) {
    var s = Date.now().toString(36), a = "abcdefghijklmnopqrstuvwxyz0123456789";
    while (s.length < n) s += a[Math.floor(Math.random() * 36)];
    return s.slice(0, n);
  }

  function get(params) {
    var q = Object.keys(params).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k] == null ? "" : params[k]); }).join("&");
    return fetch(API + "?" + q, { method: "GET" }).then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "network", code: "network" }; });
  }

  function post(body) {
    // text/plain → 브라우저가 사전 확인(CORS preflight)을 하지 않음
    return fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "network", code: "network" }; });
  }

  var first = false;
  function vid() {
    var v = ls(K.vid);
    if (!v || !/^[a-z0-9]{8,32}$/.test(v)) { v = rid(16); ls(K.vid, v); first = true; }
    return v;
  }

  function user() {
    var t = ls(K.token), n = ls(K.nick), e = Number(ls(K.exp) || 0);
    if (!t || !n || e < Date.now()) return null;
    return { nick: n, token: t };
  }

  function lang() {
    var l = ls(K.lang);
    if (l) return l;
    var n = (navigator.language || "ko").toLowerCase();
    if (n.indexOf("ko") === 0) return "ko";
    if (n.indexOf("ja") === 0) return "ja";
    if (n.indexOf("zh") === 0) return /tw|hk|mo|hant/.test(n) ? "zh-Hant" : "zh-Hans";
    return "en";
  }

  function srcOf() {
    try {
      var p = new URLSearchParams(location.search), s = p.get("utm_source") || p.get("src");
      if (s) return s.slice(0, 20);
      if (!document.referrer) return "직접";
      var h = new URL(document.referrer).hostname;
      return h === location.hostname ? "" : h.slice(0, 60);
    } catch (e) { return ""; }
  }

  var visited = {};
  var CJWHub = {
    api: API,
    hubUrl: HUB_URL,
    vid: vid,
    user: user,
    lang: lang,
    setLang: function (l) { ls(K.lang, l); },
    newGameId: function () { return rid(16); },

    visit: function (game) {
      game = game || "hub";
      if (visited[game]) return Promise.resolve({ ok: true, skipped: true });
      visited[game] = 1;
      var id = vid(), s = srcOf();
      var dev = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) ? "모바일" : "PC";
      return post({ type: "visit", vid: id, first: first, dev: dev, src: s, ref: s, game: game });
    },

    login: function (nick, pin) {
      return post({ type: "login", nick: nick, pin: pin, lang: lang() }).then(function (r) {
        if (r && r.ok) {
          ls(K.nick, r.nick); ls(K.token, r.token); ls(K.exp, String(Date.now() + 29 * 86400000));
        }
        return r;
      });
    },

    logout: function () { ls(K.nick, null); ls(K.token, null); ls(K.exp, null); },

    _authed: function (body) {
      var u = user();
      if (!u) return Promise.resolve({ ok: false, error: "login", code: "auth" });
      body.token = u.token;
      return post(body).then(function (r) { if (r && r.code === "auth") CJWHub.logout(); return r; });
    },

    submitScore: function (o) {
      return CJWHub._authed({ type: "score", game: o.game, mode: o.mode || "normal", score: o.score, gid: o.gid || "", ver: o.ver || "" });
    },

    review: function (o) {
      return CJWHub._authed({ type: "review", game: o.game, stars: o.stars, text: o.text, lang: lang(), vid: vid() });
    },

    report: function (id) { return post({ type: "report", id: id, vid: vid() }); },

    request: function (o) {
      var u = user();
      return post({ type: "request", kind: o.kind, game: o.game || "", msg: o.msg, vid: vid(), token: u ? u.token : "", hp: o.hp || "" });
    },

    games: function () { return get({ action: "games" }); },
    top: function (game, mode) { return get({ action: "top", game: game, mode: mode || "normal" }); },
    reviews: function (game, page) { return get({ action: "reviews", game: game || "", page: page || 0 }); },
    notices: function () { return get({ action: "ad" }); },

    /** 게임 화면에서 허브(로그인·랭킹)로 보내기 */
    openHub: function (what) { location.href = HUB_URL + "?back=" + encodeURIComponent(location.href) + (what ? "#" + what : ""); }
  };

  root.CJWHub = CJWHub;
})(typeof window !== "undefined" ? window : this);
