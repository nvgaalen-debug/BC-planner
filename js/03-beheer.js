/* ---------- Beheer-slot: optioneel, verbergt alleen het Beheer-menu in de FRONTEND ----------
   Dit is GEEN extra serverbeveiliging — zie api/src/lib/auth.mjs voor waarom. Zonder BEHEER_WACHTWOORD
   ingesteld op de server blijft het Beheer-menu voor iedereen zichtbaar, zoals voordat dit bestand
   bestond. Met BEHEER_WACHTWOORD ingesteld is het verborgen tot iemand het wachtwoord invult; het
   blijft ontgrendeld voor dat tabblad tot "Beheer vergrendelen" of het sluiten van het tabblad
   (sessionStorage, niet localStorage — expres niet blijvend onthouden). */
const BPWKEY = "app.beheerpw";
let BEHEER_ACTIEF = null, BEHEER_OK = false;

async function beheerCheck(pw) { try { const r = await fetch("/api/beheerpw", { cache: "no-store", headers: pw ? { "x-beheer-password": pw } : {} }); return r.ok; } catch (e) { return false; } }
async function beheerStatus() {
  if (BEHEER_ACTIEF !== null) return BEHEER_ACTIEF;
  if (!SERVER) { BEHEER_ACTIEF = false; BEHEER_OK = true; return false; }
  const ok = await beheerCheck();
  BEHEER_ACTIEF = !ok;
  if (!BEHEER_ACTIEF) { BEHEER_OK = true; return false; }
  let saved = ""; try { saved = sessionStorage.getItem(BPWKEY) || ""; } catch (e) {}
  if (saved && (await beheerCheck(saved))) BEHEER_OK = true;
  return BEHEER_ACTIEF;
}
const beheerGated = () => BEHEER_ACTIEF === true && !BEHEER_OK;

let BPWASK = null;
function askBeheerPw(cb) {
  if (!BPWASK) BPWASK = new Promise((res) => beheerDialog(res)).finally(() => { BPWASK = null; });
  return BPWASK.then((ok) => { if (ok && typeof cb === "function") setTimeout(cb, 0); return ok; });
}
function beheerDialog(done) {
  let ov = document.getElementById("bpwModal");
  if (!ov) { ov = document.createElement("div"); ov.id = "bpwModal"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="bpwT"><form id="bpwF" autocomplete="off">
    <h3 id="bpwT">Beheer ontgrendelen</h3>
    <p class="note">Vul het Beheer-wachtwoord in. Dit is een los wachtwoord dat alleen het Beheer-menu toont.</p>
    <label class="fld"><span>Wachtwoord</span><input type="password" id="bpwI" required></label>
    <p id="bpwE" class="small" role="alert" style="color:var(--bad);min-height:1.3em;margin:8px 0 0"></p>
    <div class="dlg-foot"><span class="sp"></span><button type="button" class="btn" id="bpwC">Annuleren</button><button type="submit" class="btn primary" id="bpwOk">Ontgrendelen</button></div>
  </form></div>`;
  ov.hidden = false; setTimeout(() => { const i = $("#bpwI"); if (i) i.focus(); }, 20);
  const close = (ok) => { ov.hidden = true; ov.innerHTML = ""; done(ok); };
  $("#bpwC").onclick = () => close(false);
  ov.onkeydown = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(false); } };
  $("#bpwF").onsubmit = async (e) => {
    e.preventDefault();
    const raw = $("#bpwI").value; if (!raw) return;
    const btn = $("#bpwOk"), err = $("#bpwE");
    btn.disabled = true; btn.textContent = "Controleren…"; err.textContent = "";
    const ok = await beheerCheck(raw);
    if (!ok) { btn.disabled = false; btn.textContent = "Ontgrendelen"; err.textContent = "Dit wachtwoord klopt niet."; $("#bpwI").select(); return; }
    BEHEER_OK = true; try { sessionStorage.setItem(BPWKEY, raw); } catch (x) {}
    close(true);
  };
}
function beheerVergrendel() {
  BEHEER_OK = false; try { sessionStorage.removeItem(BPWKEY); } catch (e) {}
  if (S.tab === "instellingen") S.tab = "overzicht";
  render();
  toast("Beheer-menu vergrendeld.");
}
