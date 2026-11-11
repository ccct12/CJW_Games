/* CJW GAMES 허브 화면 — 화면에 넣는 사용자 글은 전부 textContent (innerHTML 금지) */
(function () {
  "use strict";
  var H = window.CJWHub;

  // ───────── 5개 국어 ─────────
  var T = {
    ko: {
      tabGames: "게임", tabRank: "랭킹", tabReviews: "후기", tabRequest: "요청",
      lead: "워크래프트3 유즈맵을 모바일에서 바로. 설치 없이 눌러서 시작하세요.",
      play: "플레이", rank: "랭킹", weekly: "주간", allTime: "전체",
      rankHint: "닉네임별 최고 점수 TOP 20 · 1분마다 갱신",
      noRecords: "아직 기록이 없어요. 첫 기록의 주인공이 되어보세요!",
      login: "로그인", logout: "로그아웃", nick: "닉네임 (2~12자)", pin: "PIN (숫자 6자리)",
      loginNote: "처음 쓰는 닉네임이면 자동으로 가입돼요. PIN은 잊으면 찾을 수 없으니 꼭 기억해 주세요.",
      cancel: "취소", send: "보내기", more: "더 보기",
      writeTitle: "방문 후기", writeNeedLogin: "후기를 쓰려면 로그인해 주세요. (24시간에 1번)",
      reviewPh: "게임은 어땠나요? (200자, 링크 불가)", reviewGame: "어떤 게임?", siteAll: "사이트 전체",
      post: "후기 올리기", nextAt: "다음 후기는 {t} 이후에 쓸 수 있어요",
      filterAll: "모든 후기", noReviews: "아직 후기가 없어요.", reply: "운영자 답글",
      report: "신고", reported: "신고했어요", reportAsk: "이 후기를 신고할까요?",
      reqKind: "종류", kindGame: "게임 요청", kindBug: "버그 제보", kindEtc: "기타",
      reqGame: "게임 이름 (선택)", reqMsg: "내용", reqHint: "1분에 1번 보낼 수 있어요. 처리 상황은 공지로 알려드려요.",
      sent: "보냈어요. 고마워요!", posted: "후기를 올렸어요!", loggedIn: "{n}님 환영해요!", loggedOut: "로그아웃했어요",
      backToGame: "← 게임으로 돌아가기", ratingN: "({n})", noRating: "후기 없음",
      footer: "비상업 팬 제작 프로젝트입니다. 각 작품의 권리는 원저작권자에게 있습니다.",
      e: { network: "연결이 불안정해요. 잠시 뒤 다시 시도해 주세요.", auth: "다시 로그인해 주세요.", nick: "닉네임은 2~12자로 써주세요.",
        pin: "PIN은 숫자 6자리예요.", reserved: "쓸 수 없는 닉네임이에요.", locked: "PIN을 여러 번 틀렸어요. 10분 뒤에 다시 해주세요.",
        banned: "이용이 제한된 닉네임이에요.", wrong: "PIN이 맞지 않아요. (남은 횟수 {left})", link: "링크는 쓸 수 없어요.",
        word: "쓸 수 없는 단어가 있어요.", "new": "처음 방문하고 1시간 뒤부터 후기를 쓸 수 있어요.", gap: "후기는 24시간에 1번 쓸 수 있어요.",
        busy: "사람이 몰려 있어요. 잠시 뒤 다시 시도해 주세요.", stars: "별점을 골라주세요.", text: "내용을 2자 이상 써주세요." }
    },
    en: {
      tabGames: "Games", tabRank: "Ranking", tabReviews: "Reviews", tabRequest: "Request",
      lead: "Classic Warcraft III custom maps, rebuilt for your phone. No install — just tap and play.",
      play: "Play", rank: "Ranking", weekly: "This week", allTime: "All time",
      rankHint: "Top 20 best scores per nickname · updates every minute",
      noRecords: "No records yet. Be the first!",
      login: "Log in", logout: "Log out", nick: "Nickname (2–12 chars)", pin: "PIN (6 digits)",
      loginNote: "A new nickname signs you up automatically. Your PIN cannot be recovered, so please remember it.",
      cancel: "Cancel", send: "Send", more: "Load more",
      writeTitle: "Visitor reviews", writeNeedLogin: "Log in to write a review (once every 24 hours).",
      reviewPh: "How was the game? (200 chars, no links)", reviewGame: "Which game?", siteAll: "Whole site",
      post: "Post review", nextAt: "You can post your next review after {t}",
      filterAll: "All reviews", noReviews: "No reviews yet.", reply: "Reply from the developer",
      report: "Report", reported: "Reported", reportAsk: "Report this review?",
      reqKind: "Type", kindGame: "Game request", kindBug: "Bug report", kindEtc: "Other",
      reqGame: "Game name (optional)", reqMsg: "Message", reqHint: "You can send one message per minute. Updates are posted as notices.",
      sent: "Sent. Thank you!", posted: "Review posted!", loggedIn: "Welcome, {n}!", loggedOut: "Logged out",
      backToGame: "← Back to the game", ratingN: "({n})", noRating: "No reviews",
      footer: "A non-commercial fan project. All rights to the original works belong to their respective owners.",
      e: { network: "Connection problem. Please try again shortly.", auth: "Please log in again.", nick: "Nickname must be 2–12 characters.",
        pin: "PIN must be 6 digits.", reserved: "That nickname isn't allowed.", locked: "Too many wrong PINs. Try again in 10 minutes.",
        banned: "This nickname has been restricted.", wrong: "Wrong PIN. ({left} tries left)", link: "Links aren't allowed.",
        word: "Your text contains a blocked word.", "new": "You can write a review 1 hour after your first visit.", gap: "You can post one review every 24 hours.",
        busy: "The server is busy. Please try again shortly.", stars: "Please choose a rating.", text: "Please write at least 2 characters." }
    },
    ja: {
      tabGames: "ゲーム", tabRank: "ランキング", tabReviews: "レビュー", tabRequest: "リクエスト",
      lead: "Warcraft III のカスタムマップをスマホで。インストール不要、タップですぐ遊べます。",
      play: "プレイ", rank: "ランキング", weekly: "今週", allTime: "全期間",
      rankHint: "ニックネームごとのベストスコア TOP20・1分ごとに更新",
      noRecords: "まだ記録がありません。最初の記録を作りましょう！",
      login: "ログイン", logout: "ログアウト", nick: "ニックネーム（2〜12文字）", pin: "PIN（数字6桁）",
      loginNote: "新しいニックネームなら自動で登録されます。PIN は再発行できないので必ず覚えておいてください。",
      cancel: "キャンセル", send: "送信", more: "もっと見る",
      writeTitle: "訪問レビュー", writeNeedLogin: "レビューを書くにはログインしてください（24時間に1回）。",
      reviewPh: "ゲームはどうでしたか？（200文字・リンク不可）", reviewGame: "どのゲーム？", siteAll: "サイト全体",
      post: "レビューを投稿", nextAt: "次のレビューは {t} 以降に書けます",
      filterAll: "すべてのレビュー", noReviews: "まだレビューがありません。", reply: "運営者からの返信",
      report: "通報", reported: "通報しました", reportAsk: "このレビューを通報しますか？",
      reqKind: "種類", kindGame: "ゲームのリクエスト", kindBug: "バグ報告", kindEtc: "その他",
      reqGame: "ゲーム名（任意）", reqMsg: "内容", reqHint: "1分に1回送信できます。対応状況はお知らせでご案内します。",
      sent: "送信しました。ありがとうございます！", posted: "レビューを投稿しました！", loggedIn: "{n} さん、ようこそ！", loggedOut: "ログアウトしました",
      backToGame: "← ゲームに戻る", ratingN: "({n})", noRating: "レビューなし",
      footer: "非営利のファン制作プロジェクトです。各作品の権利は原著作権者に帰属します。",
      e: { network: "接続が不安定です。しばらくしてからもう一度お試しください。", auth: "もう一度ログインしてください。", nick: "ニックネームは2〜12文字です。",
        pin: "PIN は数字6桁です。", reserved: "そのニックネームは使えません。", locked: "PIN を何度も間違えました。10分後にもう一度お試しください。",
        banned: "このニックネームは利用が制限されています。", wrong: "PIN が違います。（残り {left} 回）", link: "リンクは使えません。",
        word: "使えない言葉が含まれています。", "new": "初回訪問から1時間後にレビューを書けます。", gap: "レビューは24時間に1回です。",
        busy: "混み合っています。しばらくしてからお試しください。", stars: "評価を選んでください。", text: "2文字以上入力してください。" }
    },
    "zh-Hans": {
      tabGames: "游戏", tabRank: "排行榜", tabReviews: "评价", tabRequest: "需求",
      lead: "把魔兽争霸3自定义地图搬到手机上。无需安装，点开即玩。",
      play: "开始", rank: "排行榜", weekly: "本周", allTime: "总榜",
      rankHint: "每个昵称的最高分 TOP20 · 每分钟更新",
      noRecords: "还没有记录，来创造第一个纪录吧！",
      login: "登录", logout: "退出", nick: "昵称（2–12个字）", pin: "PIN（6位数字）",
      loginNote: "使用新昵称会自动注册。PIN 无法找回，请务必记住。",
      cancel: "取消", send: "发送", more: "加载更多",
      writeTitle: "访客评价", writeNeedLogin: "登录后才能写评价（每24小时一次）。",
      reviewPh: "游戏怎么样？（200字以内，不能含链接）", reviewGame: "哪个游戏？", siteAll: "整个网站",
      post: "发布评价", nextAt: "{t} 之后可以再写评价",
      filterAll: "全部评价", noReviews: "还没有评价。", reply: "运营者回复",
      report: "举报", reported: "已举报", reportAsk: "要举报这条评价吗？",
      reqKind: "类型", kindGame: "游戏需求", kindBug: "错误反馈", kindEtc: "其他",
      reqGame: "游戏名称（可选）", reqMsg: "内容", reqHint: "每分钟可发送一次。处理进度会通过公告告知。",
      sent: "已发送，谢谢！", posted: "评价已发布！", loggedIn: "欢迎你，{n}！", loggedOut: "已退出",
      backToGame: "← 返回游戏", ratingN: "({n})", noRating: "暂无评价",
      footer: "非商业粉丝制作项目。各作品的版权归原著作权人所有。",
      e: { network: "网络不稳定，请稍后再试。", auth: "请重新登录。", nick: "昵称须为2–12个字。",
        pin: "PIN 为6位数字。", reserved: "该昵称不可使用。", locked: "PIN 错误次数过多，请10分钟后再试。",
        banned: "该昵称已被限制使用。", wrong: "PIN 不正确。（还剩 {left} 次）", link: "不能包含链接。",
        word: "内容包含禁用词。", "new": "首次访问1小时后才能写评价。", gap: "每24小时只能写一次评价。",
        busy: "服务器繁忙，请稍后再试。", stars: "请选择评分。", text: "请至少输入2个字。" }
    },
    "zh-Hant": {
      tabGames: "遊戲", tabRank: "排行榜", tabReviews: "評價", tabRequest: "需求",
      lead: "把魔獸爭霸3自訂地圖搬到手機上。免安裝，點開即玩。",
      play: "開始", rank: "排行榜", weekly: "本週", allTime: "總榜",
      rankHint: "每個暱稱的最高分 TOP20 · 每分鐘更新",
      noRecords: "還沒有紀錄，來創造第一個紀錄吧！",
      login: "登入", logout: "登出", nick: "暱稱（2–12個字）", pin: "PIN（6位數字）",
      loginNote: "使用新暱稱會自動註冊。PIN 無法找回，請務必記住。",
      cancel: "取消", send: "送出", more: "載入更多",
      writeTitle: "訪客評價", writeNeedLogin: "登入後才能寫評價（每24小時一次）。",
      reviewPh: "遊戲好玩嗎？（200字以內，不能含連結）", reviewGame: "哪個遊戲？", siteAll: "整個網站",
      post: "發布評價", nextAt: "{t} 之後可以再寫評價",
      filterAll: "全部評價", noReviews: "還沒有評價。", reply: "營運者回覆",
      report: "檢舉", reported: "已檢舉", reportAsk: "要檢舉這則評價嗎？",
      reqKind: "類型", kindGame: "遊戲需求", kindBug: "錯誤回報", kindEtc: "其他",
      reqGame: "遊戲名稱（選填）", reqMsg: "內容", reqHint: "每分鐘可送出一次。處理進度會透過公告通知。",
      sent: "已送出，謝謝！", posted: "評價已發布！", loggedIn: "歡迎你，{n}！", loggedOut: "已登出",
      backToGame: "← 返回遊戲", ratingN: "({n})", noRating: "尚無評價",
      footer: "非商業粉絲製作專案。各作品的版權歸原著作權人所有。",
      e: { network: "網路不穩定，請稍後再試。", auth: "請重新登入。", nick: "暱稱須為2–12個字。",
        pin: "PIN 為6位數字。", reserved: "此暱稱無法使用。", locked: "PIN 錯誤次數過多，請10分鐘後再試。",
        banned: "此暱稱已被限制使用。", wrong: "PIN 不正確。（剩餘 {left} 次）", link: "不能包含連結。",
        word: "內容包含禁用詞。", "new": "首次造訪1小時後才能寫評價。", gap: "每24小時只能寫一次評價。",
        busy: "伺服器忙碌中，請稍後再試。", stars: "請選擇評分。", text: "請至少輸入2個字。" }
    }
  };
  var LOCALE = { ko: "ko-KR", en: "en-US", ja: "ja-JP", "zh-Hans": "zh-CN", "zh-Hant": "zh-TW" };
  var FLAG = { ko: "KO", en: "EN", ja: "JA", "zh-Hans": "简", "zh-Hant": "繁" };

  var lang = T[H.lang()] ? H.lang() : "ko";
  function t(k, vars) {
    var s = (T[lang] && T[lang][k]) || T.ko[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace("{" + v + "}", vars[v]); });
    return s;
  }
  function errMsg(r) {
    var m = r && r.code && ((T[lang].e || {})[r.code] || T.ko.e[r.code]);
    if (m) return m.replace("{left}", r.left != null ? r.left : "?");
    if (r && r.error === "busy") return T[lang].e.busy;
    return (r && r.error) || T[lang].e.network;
  }

  // ───────── DOM 도우미 (textContent 만 사용) ─────────
  function $(s) { return document.querySelector(s); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "cls") n.className = attrs[k];
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
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
  function starStr(n) { var s = ""; for (var i = 1; i <= 5; i++) s += i <= Math.round(n) ? "★" : "☆"; return s; }

  // ───────── 상태 ─────────
  var games = [], rating = {}, rankGame = "", rankPeriod = "week", rvGame = "", rvPage = 0, pickStars = 0;

  function gameName(id) {
    if (id === "hub") return t("siteAll");
    for (var i = 0; i < games.length; i++) if (games[i].id === id) return games[i].name[lang] || games[i].name.ko || id;
    return id;
  }
  function hue(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; }
  function initials(g) { return g.id.replace(/_/g, " ").toUpperCase().slice(0, 4); }

  // ───────── 언어 ─────────
  function applyLang() {
    document.documentElement.lang = lang;
    $("#lang").value = lang;
    document.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = t(n.getAttribute("data-t")); });
    $("#rq-form [name=msg]").placeholder = "";
    renderMe(); renderGames(); renderRankGames(); renderRvFilter(); renderWrite(); renderBack();
  }

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
    if (H.user()) {
      if (confirm(t("logout") + "?")) { H.logout(); renderMe(); renderWrite(); toast(t("loggedOut")); }
    } else openLogin();
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
      closeLogin(); renderMe(); renderWrite(); renderRank();
      toast(t("loggedIn", { n: r.nick }));
    });
  });

  // ───────── 게임으로 돌아가기 ─────────
  var back = "";
  try {
    var b = new URLSearchParams(location.search).get("back") || "";
    if (/^https:\/\/ccct12\.github\.io\//.test(b)) back = b;
  } catch (e) {}
  function renderBack() {
    $("#back").hidden = !back;
    if (back) { $("#back-a").href = back; $("#back-a").textContent = t("backToGame"); }
  }

  // ───────── 공지 (광고 탭) ─────────
  function loadNotice() {
    H.notices().then(function (r) {
      var box = $("#notice"); clear(box);
      if (!r.ok || !r.ads || !r.ads.length) { box.hidden = true; return; }
      var a = r.ads[0], body = a.link ? el("a", { href: a.link, target: "_blank", rel: "noopener", text: a.text }) : el("span", { text: a.text });
      if (a.who) box.appendChild(el("b", { text: a.who }));
      box.appendChild(body); box.hidden = false;
    });
  }

  // ───────── 게임 목록 ─────────
  function renderGames() {
    var box = $("#game-list"); clear(box);
    if (!games.length) { box.appendChild(el("div", { cls: "skel" })); box.appendChild(el("div", { cls: "skel" })); return; }
    games.forEach(function (g) {
      var h = hue(g.id), th = el("div", { cls: "thumb", text: g.thumb ? "" : initials(g) });
      th.style.background = g.thumb ? "" : "linear-gradient(135deg,hsl(" + h + ",70%,45%),hsl(" + ((h + 50) % 360) + ",70%,28%))";
      if (g.thumb && /^https:\/\//.test(g.thumb)) th.style.backgroundImage = "url(\"" + g.thumb.replace(/["\\]/g, "") + "\")";
      var rt = rating[g.id];
      var stars = el("div", { cls: "stars", text: rt ? starStr(rt.avg) + " " + rt.avg.toFixed(1) : t("noRating") }, [rt ? el("span", { cls: "n", text: t("ratingN", { n: rt.n }) }) : null]);
      var playUrl = /^https:\/\//.test(g.url) ? g.url : "#";
      box.appendChild(el("article", { cls: "game" }, [
        th,
        el("div", { cls: "game-b" }, [
          el("div", { cls: "game-n", text: g.name[lang] || g.name.ko }),
          stars,
          el("div", { cls: "game-a" }, [
            el("a", { cls: "btn sm", href: playUrl, text: t("play") }),
            el("button", { cls: "btn ghost sm", type: "button", text: t("rank"), onclick: function () { rankGame = g.id; location.hash = "#rank"; } })
          ])
        ])
      ]));
    });
  }
  function loadGames() {
    renderGames();
    return H.games().then(function (r) {
      if (!r.ok) { clear($("#game-list")); $("#game-list").appendChild(el("p", { cls: "empty", text: errMsg(r) })); return; }
      games = r.games || []; rating = r.rating || {};
      if (!rankGame && games[0]) rankGame = games[0].id;
      renderGames(); renderRankGames(); renderRvFilter(); renderWrite();
      if (location.hash === "#rank") renderRank();
    });
  }

  // ───────── 랭킹 ─────────
  function renderRankGames() {
    var box = $("#rank-games"); clear(box);
    games.forEach(function (g) {
      box.appendChild(el("button", { type: "button", cls: g.id === rankGame ? "on" : "", text: g.name[lang] || g.name.ko,
        onclick: function () { rankGame = g.id; renderRankGames(); renderRank(); } }));
    });
    document.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-period") === rankPeriod); });
  }
  document.querySelectorAll(".seg button").forEach(function (b) {
    b.addEventListener("click", function () { rankPeriod = b.getAttribute("data-period"); renderRankGames(); renderRank(); });
  });
  var rankCache = {};
  function renderRank() {
    var list = $("#rank-list");
    if (!rankGame) return;
    var draw = function (r) {
      clear(list);
      var rows = (r && r[rankPeriod]) || [], me = (H.user() || {}).nick;
      if (!rows.length) { list.appendChild(el("li", { cls: "empty", text: r && !r.ok ? errMsg(r) : t("noRecords") })); return; }
      rows.forEach(function (x, i) {
        list.appendChild(el("li", { cls: x.nick === me ? "me" : "" }, [
          el("span", { cls: "no", text: String(i + 1) }),
          el("span", { text: x.nick }),
          el("span", { cls: "sc", text: Number(x.score).toLocaleString(LOCALE[lang]) })
        ]));
      });
    };
    var key = rankGame + "|normal", c = rankCache[key];
    if (c && Date.now() - c.at < 60000) { draw(c.r); return; }
    clear(list); list.appendChild(el("li", { cls: "empty", text: "…" }));
    H.top(rankGame, "normal").then(function (r) { if (r.ok) rankCache[key] = { at: Date.now(), r: r }; if (key === rankGame + "|normal") draw(r); });
  }

  // ───────── 후기 ─────────
  function renderRvFilter() {
    var s = $("#rv-filter"); clear(s);
    s.appendChild(el("option", { value: "", text: t("filterAll") }));
    games.forEach(function (g) { s.appendChild(el("option", { value: g.id, text: g.name[lang] || g.name.ko })); });
    s.appendChild(el("option", { value: "hub", text: t("siteAll") }));
    s.value = rvGame;
  }
  $("#rv-filter").addEventListener("change", function (e) { rvGame = e.target.value; rvPage = 0; loadReviews(); });

  function renderWrite() {
    var box = $("#rv-write"); clear(box);
    box.appendChild(el("strong", { text: t("writeTitle") }));
    var u = H.user();
    if (!u) {
      box.appendChild(el("p", { cls: "hint", text: t("writeNeedLogin") }));
      box.appendChild(el("button", { cls: "btn wide", type: "button", text: t("login"), onclick: openLogin }));
      return;
    }
    var next = Number(localStorage.getItem("cjw.rvNext." + u.nick) || 0);
    if (next > Date.now()) { box.appendChild(el("p", { cls: "hint", text: t("nextAt", { t: fmtTime(next) }) })); return; }
    var sel = el("select", { "aria-label": t("reviewGame") });
    games.forEach(function (g) { sel.appendChild(el("option", { value: g.id, text: g.name[lang] || g.name.ko })); });
    sel.appendChild(el("option", { value: "hub", text: t("siteAll") }));
    if (rvGame) sel.value = rvGame;
    pickStars = 0;
    var sp = el("div", { cls: "starpick", role: "radiogroup" });
    for (var i = 1; i <= 5; i++) (function (n) {
      sp.appendChild(el("button", { type: "button", text: "★", "aria-label": n + "/5", onclick: function () {
        pickStars = n; sp.querySelectorAll("button").forEach(function (b, j) { b.classList.toggle("on", j < n); });
      } }));
    })(i);
    var ta = el("textarea", { rows: "3", maxlength: "200", placeholder: t("reviewPh") });
    var cnt = el("div", { cls: "count", text: "0/200" });
    ta.addEventListener("input", function () { cnt.textContent = ta.value.length + "/200"; });
    var err = el("p", { cls: "err", hidden: "" });
    var btn = el("button", { cls: "btn wide", type: "button", text: t("post") });
    btn.addEventListener("click", function () {
      err.hidden = true;
      if (!pickStars) { err.textContent = T[lang].e.stars; err.hidden = false; return; }
      if (ta.value.trim().length < 2) { err.textContent = T[lang].e.text; err.hidden = false; return; }
      btn.disabled = true;
      H.review({ game: sel.value, stars: pickStars, text: ta.value.trim() }).then(function (r) {
        btn.disabled = false;
        if (r.code === "gap" && r.next) localStorage.setItem("cjw.rvNext." + u.nick, String(r.next));
        if (!r.ok) { err.textContent = errMsg(r); err.hidden = false; if (r.code === "auth") { renderMe(); renderWrite(); } if (r.code === "gap") renderWrite(); return; }
        localStorage.setItem("cjw.rvNext." + u.nick, String(Date.now() + 24 * 3600000));
        toast(t("posted")); renderWrite(); rvPage = 0; loadReviews(); loadGames();
      });
    });
    box.appendChild(el("div", { cls: "row" }, [sel]));
    box.appendChild(sp); box.appendChild(ta); box.appendChild(cnt); box.appendChild(err); box.appendChild(btn);
  }

  function reviewItem(x) {
    var rep = el("button", { cls: "rv-x", type: "button", text: t("report"), onclick: function () {
      if (!confirm(t("reportAsk"))) return;
      rep.disabled = true;
      H.report(x.id).then(function (r) { rep.textContent = r.ok ? t("reported") : errMsg(r); if (r.hidden) li.remove(); });
    } });
    var li = el("li", { cls: "rv" }, [
      rep,
      el("div", { cls: "rv-h" }, [
        el("span", { cls: "who", text: x.nick }),
        el("span", { cls: "stars", text: starStr(x.stars) }),
        el("span", { cls: "tag", text: gameName(x.game) }),
        el("span", { text: (FLAG[x.lang] || "") + " · " + fmtTime(x.t) })
      ]),
      el("p", { cls: "rv-t", text: x.text }),
      x.reply ? el("div", { cls: "rv-r" }, [el("b", { text: t("reply") }), document.createTextNode(x.reply)]) : null
    ]);
    return li;
  }
  function loadReviews() {
    var list = $("#rv-list"), more = $("#rv-more");
    if (rvPage === 0) { clear(list); list.appendChild(el("li", { cls: "empty", text: "…" })); }
    more.hidden = true;
    H.reviews(rvGame, rvPage).then(function (r) {
      if (rvPage === 0) clear(list);
      if (!r.ok) { list.appendChild(el("li", { cls: "empty", text: errMsg(r) })); return; }
      if (!r.reviews.length && rvPage === 0) list.appendChild(el("li", { cls: "empty", text: t("noReviews") }));
      r.reviews.forEach(function (x) { list.appendChild(reviewItem(x)); });
      more.hidden = !r.more;
    });
  }
  $("#rv-more").addEventListener("click", function () { rvPage++; loadReviews(); });

  // ───────── 요청함 ─────────
  $("#rq-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, btn = f.querySelector("[type=submit]"), msg = f.msg.value.trim();
    if (msg.length < 2) { toast(T[lang].e.text); return; }
    btn.disabled = true;
    H.request({ kind: f.kind.value, game: f.game.value.trim(), msg: msg, hp: f.hp.value }).then(function (r) {
      btn.disabled = false;
      if (!r.ok) { toast(errMsg(r)); return; }
      f.reset(); toast(t("sent"));
    });
  });

  // ───────── 탭 (주소 #) ─────────
  var loaded = {};
  function route() {
    var h = (location.hash || "#games").slice(1);
    if (h === "login") { h = "games"; if (!H.user()) setTimeout(openLogin, 0); }
    if (["games", "rank", "reviews", "request"].indexOf(h) < 0) h = "games";
    document.querySelectorAll(".view").forEach(function (v) { v.hidden = v.id !== "v-" + h; });
    document.querySelectorAll(".tabs a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-tab") === h); });
    if (h === "rank") { renderRankGames(); renderRank(); }
    if (h === "reviews" && !loaded.reviews) { loaded.reviews = 1; loadReviews(); }
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  $("#lang").addEventListener("change", function (e) { lang = e.target.value; H.setLang(lang); applyLang(); if (location.hash === "#rank") renderRank(); });

  // ───────── 시작 ─────────
  applyLang();
  route();
  loadGames();
  loadNotice();
  H.visit("hub");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
