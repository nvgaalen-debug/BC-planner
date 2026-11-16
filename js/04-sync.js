/* ---------- gedeelde status op de server (enige opslag; geen lokale kopie) ----------
   Uitgangspunt: wat op de server staat (/api/state), is de waarheid. Er wordt niets lokaal bewaard.
   - Elke wijziging gaat direct naar de server.
   - Een wijziging geldt pas als de server die heeft bevestigd (version opgehoogd).
   - Bij een conflict (iemand anders sloeg eerder op) of een fout wordt de serverversie opnieuw geladen
     en de niet-bewaarde wijziging weggegooid, met een melding. Geen stille overschrijving.
   - Zolang de data niet van de server is geladen, is er niets te bewerken en wordt niets opgeslagen.
   D is de ene globale status-variabele; pas de vorm aan naar wat jouw app nodig heeft. */
let D = { settings: { titel: "BC Resource Planner" } };
let SYNC = { sv: null }, SYNC_READY = false;
let PUSH_P = null, PUSH_DIRTY = false;

function setLaden(html) {
  const v = $("#view"); if (!v) return;
  v.innerHTML = `<section class="panel sec" style="margin-top:24px"><h2>${esc(D.settings?.titel || "Mijn app")}</h2>${html}</section>`;
}
function startFout(msg) {
  SYNC_READY = false;
  setLaden(`<p class="note" style="color:var(--bad)">${esc(msg)}</p><div class="row"><button class="btn primary" data-act="srvretry">Opnieuw proberen</button></div>`);
}

async function initSync() {
  if (!SERVER) { SYNC.sv = 0; SYNC_READY = true; render(); return; }
  setLaden("<p class=\"note\">Gegevens laden van de server…</p>");
  let r;
  try { r = await withPw(() => api("/api/state")); }
  catch (e) { startFout("De gegevens kunnen niet van de server worden geladen. " + apiErr(e)); return; }
  if (r.data === null || r.data === undefined) {
    SYNC.sv = 0; SYNC_READY = true; render(); pushState();
    return;
  }
  SYNC.sv = r.version; D = r.data; SYNC_READY = true; render();
}

async function herlaad(msg) {
  let r;
  try { r = await withPw(() => api("/api/state")); }
  catch (e) { startFout(msg + " Opnieuw laden lukt ook niet: " + apiErr(e)); return; }
  if (r.data === null || r.data === undefined) { startFout(msg + " De server heeft geen gegevens meer."); return; }
  SYNC.sv = r.version; D = r.data; render();
  toast(msg, 9000);
}

/* Alle wijzigingen naar de server. Terwijl er een opslag loopt, worden nieuwe wijzigingen één keer
   meegestuurd (geen parallelle schrijfacties, geen verlies van volgorde). */
function pushState() {
  if (!SERVER || !SYNC_READY) return Promise.resolve();
  PUSH_DIRTY = true;
  if (!PUSH_P) PUSH_P = runPush().finally(() => { PUSH_P = null; });
  return PUSH_P;
}
async function runPush() {
  while (PUSH_DIRTY) {
    PUSH_DIRTY = false;
    const ok = await stuurNu();
    if (!ok) break;
  }
}
async function stuurNu() {
  const text = JSON.stringify(D);
  try {
    const r = await withPw(() => api("/api/state", { method: "PUT", body: '{"data":' + text + ',"version":' + SYNC.sv + "}" }));
    SYNC.sv = r.version;
    return true;
  } catch (e) {
    PUSH_DIRTY = false;
    if (e && e.code === "pw") { toast("Niet opgeslagen: het wachtwoord is nodig. Vul het in en probeer het opnieuw.", 7000); return false; }
    if (e && e.code === "srv" && e.status === 409) {
      await herlaad("Iemand anders heeft de gegevens net opgeslagen. Je laatste wijziging is niet bewaard; de serverversie is geladen.");
      return false;
    }
    await herlaad("Opslaan op de server mislukt (" + (e && e.message ? e.message : "geen verbinding") + "). Je laatste wijziging is niet bewaard.");
    return false;
  }
}
