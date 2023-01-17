console.log("[light-vite] connecting...");
var p = new WebSocket("ws://localhost:__HMR_PORT__", "light-vite-hmr");
p.addEventListener("message", async ({ data: e }) => {
  u(JSON.parse(e)).catch(console.error);
});
async function u(e) {
  switch (e.type) {
    case "connected":
      console.log("[light-vite] connected."),
        setInterval(() => p.send("ping"), 1e3);
      break;
    case "update":
      e.updates.forEach((t) => {
        t.type === "js-update" && f(t);
      });
      break;
  }
}
var i = new Map(),
  g = new Map(),
  m = (e) => {
    let t = i.get(e);
    t && (t.callbacks = []);
    function n(s, o) {
      let a = i.get(e) || { id: e, callbacks: [] };
      a.callbacks.push({ deps: s, fn: o }), i.set(e, a);
    }
    return {
      accept(s) {
        (typeof s == "function" || !s) && n([e], ([o]) => s && s(o));
      },
      prune(s) {
        g.set(e, s);
      },
    };
  };
async function f({ path: e, timestamp: t }) {
  let n = i.get(e);
  if (!n) return;
  let s = new Map(),
    o = new Set();
  return (
    o.add(e),
    await Promise.all(
      Array.from(o).map(async (a) => {
        let [r, c] = a.split("?");
        try {
          let d = await import(r + `?t=${t}${c ? `&${c}` : ""}`);
          s.set(a, d);
        } catch {}
      })
    ),
    () => {
      for (let { deps: a, fn: r } of n.callbacks) r(a.map((c) => s.get(c)));
      console.log(`[light-vite] hot updated: ${e}`);
    }
  );
}
var l = new Map();
function y(e, t) {
  let n = l.get(e);
  n
    ? (n.innerHTML = t)
    : ((n = document.createElement("style")),
      n.setAttribute("type", "text/css"),
      (n.innerHTML = t),
      document.head.appendChild(n)),
    l.set(e, n);
}
function M(e) {
  let t = l.get(e);
  t && document.head.removeChild(t), l.delete(e);
}
export { m as createHotContext, M as removeStyle, y as updateStyle };
//# sourceMappingURL=client.mjs.map
