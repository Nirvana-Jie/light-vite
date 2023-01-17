"use strict";
var d = Object.defineProperty;
var g = Object.getOwnPropertyDescriptor;
var f = Object.getOwnPropertyNames;
var m = Object.prototype.hasOwnProperty;
var y = (e, t) => {
    for (var n in t) d(e, n, { get: t[n], enumerable: !0 });
  },
  M = (e, t, n, s) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let a of f(t))
        !m.call(e, a) &&
          a !== n &&
          d(e, a, {
            get: () => t[a],
            enumerable: !(s = g(t, a)) || s.enumerable,
          });
    return e;
  };
var h = (e) => M(d({}, "__esModule", { value: !0 }), e);
var C = {};
y(C, { createHotContext: () => k, removeStyle: () => x, updateStyle: () => w });
module.exports = h(C);
console.log("[light-vite] connecting...");
var u = new WebSocket("ws://localhost:__HMR_PORT__", "light-vite-hmr");
u.addEventListener("message", async ({ data: e }) => {
  b(JSON.parse(e)).catch(console.error);
});
async function b(e) {
  switch (e.type) {
    case "connected":
      console.log("[light-vite] connected."),
        setInterval(() => u.send("ping"), 1e3);
      break;
    case "update":
      e.updates.forEach((t) => {
        t.type === "js-update" && H(t);
      });
      break;
  }
}
var i = new Map(),
  v = new Map(),
  k = (e) => {
    let t = i.get(e);
    t && (t.callbacks = []);
    function n(s, a) {
      let o = i.get(e) || { id: e, callbacks: [] };
      o.callbacks.push({ deps: s, fn: a }), i.set(e, o);
    }
    return {
      accept(s) {
        (typeof s == "function" || !s) && n([e], ([a]) => s && s(a));
      },
      prune(s) {
        v.set(e, s);
      },
    };
  };
async function H({ path: e, timestamp: t }) {
  let n = i.get(e);
  if (!n) return;
  let s = new Map(),
    a = new Set();
  return (
    a.add(e),
    await Promise.all(
      Array.from(a).map(async (o) => {
        let [r, c] = o.split("?");
        try {
          let p = await import(r + `?t=${t}${c ? `&${c}` : ""}`);
          s.set(o, p);
        } catch {}
      })
    ),
    () => {
      for (let { deps: o, fn: r } of n.callbacks) r(o.map((c) => s.get(c)));
      console.log(`[light-vite] hot updated: ${e}`);
    }
  );
}
var l = new Map();
function w(e, t) {
  let n = l.get(e);
  n
    ? (n.innerHTML = t)
    : ((n = document.createElement("style")),
      n.setAttribute("type", "text/css"),
      (n.innerHTML = t),
      document.head.appendChild(n)),
    l.set(e, n);
}
function x(e) {
  let t = l.get(e);
  t && document.head.removeChild(t), l.delete(e);
}
0 && (module.exports = { createHotContext, removeStyle, updateStyle });
//# sourceMappingURL=client.js.map
