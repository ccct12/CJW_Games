/* CJW GAMES 허브 서비스 워커 — 허브 화면 파일만 저장 (API·게임 파일은 저장 안 함) */
var V = "hub-v3";
var SHELL = ["./", "index.html", "hub.css?v=3", "hub.js?v=3", "sdk.js?v=3", "icon.svg", "manifest.webmanifest"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf("hub-") === 0 && k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.indexOf("/CJW_Games/") !== 0) return;
  // 화면(HTML)은 네트워크 먼저 → 실패하면 저장본
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(function (r) {
      var cp = r.clone(); caches.open(V).then(function (c) { c.put("index.html", cp); }); return r;
    }).catch(function () { return caches.match("index.html"); }));
    return;
  }
  // 나머지는 저장본 먼저, 뒤에서 새로 받아 갱신
  e.respondWith(caches.match(e.request).then(function (hit) {
    var net = fetch(e.request).then(function (r) {
      if (r.ok) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
