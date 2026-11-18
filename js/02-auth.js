/* ---------- app-wachtwoord: één gedeeld wachtwoord voor de hele API (APP_PASSWORD) ----------
   Dit is GEEN gebruikersaccount-systeem: iedereen die het wachtwoord kent, kan alles. Voldoende voor
   een klein team op één gedeelde app; voor echte rollen/rechten is een ander model nodig. */
const SERVER = (() => { try { return typeof window !== "undefined" && /^https?:$/.test(location.protocol); } catch (e) { return false; } })();
const PWKEY = "app.pw", PWKEEP = "app.pw.onthouden";
let PWMEM = "";

async function api(path, opts = {}) {
  const sent = getPw();
  const r = await fetch(path, { cache: "no-store", ...opts, headers: { "content-type": "application/json", "x-app-password": sent, ...(opts.headers || {}) } });
  let d = {}; try { d = await r.json(); } catch (e) {}
  if (r.status === 401) throw { code: "pw", message: d.error, used: sent };
  if (r.status === 404) throw { code: "nofn" };
  if (!r.ok) throw { code: "srv", status: r.status, message: d.error, detail: d.detail, hint: d.hint };
  return d;
}
const apiErr = (e) => e.code === "nofn" ? "De serverfunctie is niet gevonden." : e.code === "pw" ? "Het wachtwoord klopt niet." : ((e.message || "Geen verbinding met de server.") + (e.detail ? " — " + e.detail : "") + (e.hint ? " [" + e.hint + "]" : ""));

function getPw() {
  if (PWMEM) return PWMEM;
  let v = ""; try { v = sessionStorage.getItem(PWKEY) || localStorage.getItem(PWKEEP) || ""; } catch (e) {}
  if (v) PWMEM = v;
  return v;
}
const pwStore = (v, keep) => { try { if (v) sessionStorage.setItem(PWKEY, v); else sessionStorage.removeItem(PWKEY); if (keep) { if (v) localStorage.setItem(PWKEEP, v); else localStorage.removeItem(PWKEEP); } } catch (e) {} };
function pwForget(bad) {
  if (bad && getPw() !== bad) return;
  PWMEM = ""; try { sessionStorage.removeItem(PWKEY); if (!bad || localStorage.getItem(PWKEEP) === bad) localStorage.removeItem(PWKEEP); } catch (e) {}
  try { PWBC && PWBC.postMessage({ forget: bad || "" }); } catch (e) {}
}
function logoutPw() {
  PWMEM = ""; pwStore("");
  try { localStorage.removeItem(PWKEY); localStorage.removeItem(PWKEEP); } catch (e) {}
  try { PWBC && PWBC.postMessage({ logout: 1 }); } catch (e) {}
  toast("Uitgelogd. Bij de volgende actie die het wachtwoord nodig heeft, vraagt de app er opnieuw om.");
}

/* Wachtwoord delen tussen tabbladen van dezelfde browser, zodat niet elk tabblad apart vraagt */
let PWBC = null; try { PWBC = new BroadcastChannel("app.pw"); } catch (e) {}
if (PWBC) {
  PWBC.onmessage = (e) => {
    const m = e.data || {};
    if (m.q) { const v = getPw(); if (v) PWBC.postMessage({ pw: v }); }
    else if (m.pw && (m.force || !getPw())) { PWMEM = m.pw; try { sessionStorage.setItem(PWKEY, m.pw); if (m.force && localStorage.getItem(PWKEEP)) localStorage.setItem(PWKEEP, m.pw); } catch (x) {} }
    else if (m.forget != null) { if (!m.forget || PWMEM === m.forget) { PWMEM = ""; try { sessionStorage.removeItem(PWKEY); } catch (x) {} } }
    else if (m.logout) { PWMEM = ""; try { sessionStorage.removeItem(PWKEY); } catch (x) {} }
  };
  if (!getPw()) PWBC.postMessage({ q: 1 });
}
function peerPw() { return new Promise((res) => { if (getPw() || !PWBC) return res(getPw()); PWBC.postMessage({ q: 1 }); let t = 0; const iv = setInterval(() => { if (getPw() || ++t > 10) { clearInterval(iv); res(getPw()); } }, 50); }); }

/* Wachtwoordvenster: één tegelijk, gecontroleerd bij de server via GET /api/state */
let PWASK = null;
function askPw(cb) {
  if (!PWASK) PWASK = new Promise((res) => pwDialog(res)).finally(() => { PWASK = null; });
  return PWASK.then((ok) => { if (ok && typeof cb === "function") setTimeout(cb, 0); return ok; });
}
async function pwCheck(pw) { try { const r = await fetch("/api/state", { cache: "no-store", headers: { "x-app-password": pw } }); return r.status !== 401; } catch (e) { return null; } }
function pwDialog(done) {
  let ov = document.getElementById("pwModal");
  if (!ov) { ov = document.createElement("div"); ov.id = "pwModal"; document.body.appendChild(ov); }
  let pref = true; try { pref = localStorage.getItem("app.pwpref") !== "0"; } catch (e) {}
  ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="pwT"><form id="pwF" autocomplete="on">
    <h3 id="pwT">App-wachtwoord</h3>
    <p class="note">Vul het wachtwoord in dat als APP_PASSWORD is ingesteld. De app controleert het meteen.</p>
    <input type="text" name="username" value="app" autocomplete="username" hidden>
    <label class="fld"><span>Wachtwoord</span><input type="password" id="pwI" name="password" autocomplete="current-password" required></label>
    <label class="chk" style="margin-top:12px"><input type="checkbox" id="pwK"${pref ? " checked" : ""}> <span>Onthouden op deze computer</span></label>
    <p id="pwE" class="small" role="alert" style="color:var(--bad);min-height:1.3em;margin:8px 0 0"></p>
    <div class="dlg-foot"><span class="sp"></span><button type="button" class="btn" id="pwC">Annuleren</button><button type="submit" class="btn primary" id="pwOk">Doorgaan</button></div>
  </form></div>`;
  ov.hidden = false; setTimeout(() => { const i = $("#pwI"); if (i) i.focus(); }, 20);
  const close = (ok) => { ov.hidden = true; ov.innerHTML = ""; done(ok); };
  $("#pwC").onclick = () => close(false);
  ov.onkeydown = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(false); } };
  $("#pwF").onsubmit = async (e) => {
    e.preventDefault();
    const raw = $("#pwI").value; if (!raw) return;
    const btn = $("#pwOk"), err = $("#pwE");
    btn.disabled = true; btn.textContent = "Controleren…"; err.textContent = "";
    const ok = await pwCheck(raw);
    if (ok === false) { btn.disabled = false; btn.textContent = "Doorgaan"; err.textContent = "Dit wachtwoord klopt niet."; $("#pwI").select(); return; }
    const keep = $("#pwK").checked; try { localStorage.setItem("app.pwpref", keep ? "1" : "0"); } catch (x) {}
    PWMEM = raw; pwStore(raw, keep); try { PWBC && PWBC.postMessage({ pw: raw, force: true }); } catch (x) {}
    close(true);
  };
}

/* Rondom een API-aanroep: bij een wachtwoordfout eerst kijken of een ander tabblad het al heeft,
   anders vragen, en de aanroep dan automatisch herhalen — de aanroeper merkt er niets van. */
async function withPw(fn) {
  try { return await fn(); } catch (e) {
    if (!(e && e.code === "pw")) throw e;
    if (getPw() && getPw() !== e.used) { try { return await fn(); } catch (e2) { if (!(e2 && e2.code === "pw")) throw e2; e = e2; } }
    if (!getPw() && (await peerPw())) { try { return await fn(); } catch (e2) { if (!(e2 && e2.code === "pw")) throw e2; e = e2; } }
    if (e.used) pwForget(e.used);
    if (!(await askPw())) throw e;
    return await fn();
  }
}
