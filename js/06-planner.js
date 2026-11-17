/* ---------- BC Resource Planner: weekplanning per resource, ongepland werk, drag & drop, capaciteit ----------
   Skeleton met nepdata (demo()). Later komen resources, projecten, taken, planningsregels en verlof uit
   Business Central; de weergave en de regels hier blijven gelijk. */

const DAGEN = ["Ma", "Di", "Wo", "Do", "Vr"];
const LABEL = { vrij: "Beschikbaar", gep: "Gepland", vol: "Volledig bezet", over: "Overgepland", na: "Niet beschikbaar" };

const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const pYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = pYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
function maandag(s) { const d = s ? pYmd(s) : new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); }
const kortDatum = (s) => pYmd(s).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

const DEMO_VERSIE = 5;

function demo(mon) {
  const d = (n) => addDays(mon, n);
  return {
    versie: DEMO_VERSIE,
    settings: { titel: "BC Resource Planner" },
    groepen: ["Ontwerp", "Productie", "Montage"],
    resources: [
      { id: "r1", naam: "Lisa", groep: "Ontwerp", uren: 8 },
      { id: "r2", naam: "Ruud", groep: "Productie", uren: 8 },
      { id: "r3", naam: "Jeroen", groep: "Montage", uren: 8 },
      { id: "r4", naam: "Marcel", groep: "Montage", uren: 8 },
      { id: "r5", naam: "Sanne", groep: "Productie", uren: 8 },
      { id: "r6", naam: "Bram", groep: "Ontwerp", uren: 8 },
      { id: "r7", naam: "Ilse", groep: "Ontwerp", uren: 8 },
      { id: "r8", naam: "Ton", groep: "Montage", uren: 8 },
      { id: "r9", naam: "Eva", groep: "Productie", uren: 8 },
    ],
    projecten: [
      { id: "p1", nr: "P2026-031", naam: "Woningbouw Hoogkerk: kozijnen en deuren" },
      { id: "p2", nr: "P2026-034", naam: "Kantoor Zwolle: vliesgevel" },
      { id: "p3", nr: "P2026-037", naam: "Serre Apeldoorn" },
      { id: "p4", nr: "P2026-040", naam: "Kantoorpand Harderwijk: lichtstraat" },
    ],
    taken: [
      { id: "t1", project: "p1", groep: "Ontwerp", omschrijving: "Opname en tekeningen", budget: 16, gerealiseerd: 4 },
      { id: "t2", project: "p1", groep: "Productie", omschrijving: "Kozijnen en deuren fabriceren", budget: 48, gerealiseerd: 0 },
      { id: "t3", project: "p1", groep: "Montage", omschrijving: "Montage op bouwplaats", budget: 24, voorganger: "t2", deadline: d(4) },
      { id: "t4", project: "p2", groep: "Ontwerp", omschrijving: "Vliesgevel ontwerp", budget: 40 },
      { id: "t5", project: "p2", groep: "Productie", omschrijving: "Vliesgevel fabriceren", budget: 80, voorganger: "t4" },
      { id: "t6", project: "p3", groep: "Montage", omschrijving: "Serre plaatsen en afdichten", budget: 24, voorganger: "t7" },
      { id: "t7", project: "p3", groep: "Ontwerp", omschrijving: "Serre ontwerp", budget: 12 },
      { id: "t8", project: "p4", groep: "Ontwerp", omschrijving: "Lichtstraat ontwerp", budget: 32 },
      { id: "t9", project: "p4", groep: "Productie", omschrijving: "Lichtstraat fabriceren", budget: 64, voorganger: "t8" },
      { id: "t10", project: "p4", groep: "Montage", omschrijving: "Lichtstraat monteren", budget: 40, voorganger: "t9", deadline: d(14) },
      { id: "t11", project: "p1", groep: "Montage", omschrijving: "Afwerking en oplevering", budget: 16, voorganger: "t3" },
      { id: "t12", project: "p2", groep: "Montage", omschrijving: "Vliesgevel montage", budget: 48, voorganger: "t5" },
    ],
    planning: [
      { id: "l1", taak: "t1", resource: "r1", datum: d(0), uren: 6 },
      { id: "l2", taak: "t1", resource: "r1", datum: d(1), uren: 6 },
      { id: "l3", taak: "t2", resource: "r2", datum: d(0), uren: 8 },
      { id: "l4", taak: "t2", resource: "r2", datum: d(1), uren: 8 },
      { id: "l5", taak: "t2", resource: "r5", datum: d(2), uren: 8 },
      { id: "l6", taak: "t3", resource: "r3", datum: d(3), uren: 8 },
      { id: "l7", taak: "t4", resource: "r1", datum: d(2), uren: 8 },
      { id: "l8", taak: "t4", resource: "r1", datum: d(3), uren: 4 },
      { id: "l9", taak: "t5", resource: "r5", datum: d(4), uren: 4 },
      { id: "l10", taak: "t6", resource: "r4", datum: d(4), uren: 8 },
      { id: "l11", taak: "t8", resource: "r6", datum: d(0), uren: 8 },
      { id: "l12", taak: "t8", resource: "r6", datum: d(1), uren: 8 },
      { id: "l13", taak: "t8", resource: "r7", datum: d(2), uren: 8 },
      { id: "l14", taak: "t8", resource: "r7", datum: d(3), uren: 8 },
      { id: "l15", taak: "t9", resource: "r9", datum: d(4), uren: 8 },
      { id: "l16", taak: "t9", resource: "r9", datum: d(7), uren: 8 },
      { id: "l17", taak: "t9", resource: "r5", datum: d(7), uren: 8 },
      { id: "l18", taak: "t7", resource: "r1", datum: d(2), uren: 4 },
    ],
    verlof: [
      { id: "v1", resource: "r3", datum: d(2), uren: 8 },
      { id: "v2", resource: "r8", datum: d(4), uren: 8 },
    ],
  };
}

/* Demodata zetten als de data op de server ontbreekt of van een oudere versie is. */
/* Ongedaan maken: bewaar de staat vóór elke opslag (max 30). */
let vorigeStaat = null;
const ongedaanStapel = [];
function ensureData() {
  if (D.versie !== DEMO_VERSIE && !(D.settings?.bron === "bc")) { Object.assign(D, demo(maandag())); pushState(); }
  if (vorigeStaat === null) vorigeStaat = JSON.stringify(D);
}
ensureData();

/* Wijziging opslaan op de server en het scherm verversen. */
function save() {
  if (vorigeStaat !== null) { ongedaanStapel.push(vorigeStaat); if (ongedaanStapel.length > 30) ongedaanStapel.shift(); }
  vorigeStaat = JSON.stringify(D);
  if (!bcModus()) pushState();
  render();
}
/* BC-modus: de planner schrijft lokaal niets weg, zodat de demodata in de opslag intact blijft. */
const bcModus = () => D.settings?.bron === "bc";
function undo() {
  const s = ongedaanStapel.pop();
  if (!s) { toast("Er is niets om ongedaan te maken."); return; }
  D = JSON.parse(s); vorigeStaat = s;
  if (!bcModus()) pushState();
  render();
  toast("Laatste wijziging ongedaan gemaakt.");
}

/* ---------- rekenregels ---------- */
/* Status per toewijzing: Voorstel, Gepland, Bevestigd of Geannuleerd. Geannuleerd telt niet mee. */
const statusVan = (l) => l.status || "Gepland";
const telt = (l) => statusVan(l) !== "Geannuleerd";
const plannedFor = (res, datum) => D.planning.filter((l) => telt(l) && l.resource === res && l.datum === datum).reduce((a, l) => a + l.uren, 0);
const verlofFor = (res, datum) => D.verlof.filter((v) => v.resource === res && v.datum === datum).reduce((a, v) => a + v.uren, 0);
const capFor = (resId, datum) => { const r = D.resources.find((x) => x.id === resId); return r ? Math.max(0, r.uren - verlofFor(resId, datum)) : 0; };
/* Volgens de BC-API-spec: effectief restant = BC-prognose (remaining), zonder prognose budget - gerealiseerd. */
const geplandVan = (t) => D.planning.filter((l) => telt(l) && l.taak === t.id).reduce((a, l) => a + l.uren, 0);
const effRest = (t) => t.remaining != null ? Math.max(0, t.remaining) : Math.max(0, t.budget - (t.gerealiseerd || 0));
const restUren = (t) => Math.max(0, effRest(t) - geplandVan(t));
const prognoseBron = (t) => t.remaining != null ? "BC-prognose" : "Fallback: budget min gerealiseerd";
function signaal(t) {
  const p = geplandVan(t), e = effRest(t);
  if (p > e) return "Te veel gepland";
  return e - p > 0 ? "Extra werk plannen" : "Planning dekkend";
}
function status(r, datum) {
  const cap = capFor(r.id, datum), gep = plannedFor(r.id, datum);
  if (cap === 0 && gep === 0) return "na";
  if (gep > cap) return "over";
  if (gep > 0 && gep === cap) return "vol";
  if (gep > 0) return "gep";
  return "vrij";
}

/* ---------- weergave ---------- */
function blokHtml(l) {
  const t = D.taken.find((x) => x.id === l.taak);
  const p = t && D.projecten.find((x) => x.id === t.project);
  const dim = (S.proj && t && t.project !== S.proj ? " dim" : "") + (telt(l) ? "" : " ann") + (statusVan(l) === "Voorstel" ? " voorstel" : "");
  return `<div class="blk${dim}" data-drag="plan" data-id="${esc(l.id)}">
    <span>${esc(p ? p.nr : "")} · ${esc(t ? t.omschrijving : "")}</span>
    <span class="ctl"><button data-act="minu" data-id="${esc(l.id)}" title="1 uur minder">−</button><b>${l.uren}u</b><button data-act="plusu" data-id="${esc(l.id)}" title="1 uur meer">+</button></span>
    <button class="x" data-act="plandel" data-id="${esc(l.id)}" title="Verwijderen">×</button></div>`;
}

function viewPlanner() {
  ensureData();
  const mon = S.week || maandag();
  const dagen = DAGEN.map((_, i) => addDays(mon, i));
  const kop = dagen.map((d, i) => `<th>${DAGEN[i]} ${kortDatum(d)}</th>`).join("");

  let rijen = "";
  for (const g of D.groepen) {
    rijen += `<tr class="grp"><td colspan="6">${esc(g)}</td></tr>`;
    for (const r of D.resources.filter((x) => x.groep === g)) {
      let vrij = 0;
      const cellen = dagen.map((d) => {
        const st = status(r, d);
        vrij += capFor(r.id, d) - plannedFor(r.id, d);
        const blokken = D.planning.filter((l) => l.resource === r.id && l.datum === d).map(blokHtml).join("");
        return `<td class="cel s-${st}" data-drop="1" data-res="${esc(r.id)}" data-date="${d}" title="${LABEL[st]}">${blokken}</td>`;
      }).join("");
      const vrijTekst = vrij < 0 ? `<small class="bad">${-vrij} u overgepland</small>` : `<small>${vrij} u vrij deze week</small>`;
      rijen += `<tr><th class="res">${esc(r.naam)}<small>${esc(r.groep)} · ${r.uren}u/dag</small>${vrijTekst}</th>${cellen}</tr>`;
    }
  }

  let ongepland = "";
  let totaalNog = 0;
  for (const p of D.projecten) {
    if (S.proj && S.proj !== p.id) continue;
    const ts = D.taken.filter((t) => t.project === p.id && restUren(t) > 0);
    if (!ts.length) continue;
    ongepland += `<div class="pj"><b>${esc(p.nr)}</b> <span>${esc(p.naam)}</span>` +
      ts.map((t) => {
        const nog = restUren(t); totaalNog += nog;
        const gepl = geplandVan(t), real = t.gerealiseerd || 0;
        return `<div class="taak" data-drag="taak" data-id="${esc(t.id)}">
          <span>${esc(t.omschrijving)}</span>
          <small>${esc(t.groep)}</small>
          ${t.voorganger ? `<small class="meta">na: ${esc(omschrijvingVan(t.voorganger))}</small>` : ""}
          <span class="nu">${nog}u nog te plannen · ${signaal(t)}</span>
          <button class="btn sm" data-act="voorstel" data-id="${esc(t.id)}">Voorstel</button>
          <small class="meta">${t.budget}u budget · ${gepl}u gepland · ${real}u gerealiseerd</small></div>`;
      }).join("") + `</div>`;
  }
  if (!ongepland) ongepland = '<p class="note">Alle taken zijn volledig ingepland.</p>';

  return `<section class="sec pl">
    <div class="panel sec">
      <div class="row pl-top">
        <button class="btn" data-act="week" data-d="-7">‹ Vorige</button>
        <button class="btn" data-act="week" data-d="0">Deze week</button>
        <button class="btn" data-act="week" data-d="7">Volgende ›</button>
        <b>${kortDatum(dagen[0])} t/m ${kortDatum(dagen[4])}</b>
        <span class="sp"></span>
        <span class="chip">${totaalNog} u nog te plannen</span>
      </div>
      ${printBalk("Planning per week")}
      <div class="pl-wrap">
        <aside class="ong">
          <h3>Ongepland</h3>
          <p class="note">Sleep een taak naar een cel. Er wordt het resterende budget gepland, tot maximaal de dagcapaciteit.</p>
          <label class="fld"><span>Project</span>
            <select data-act="projfilter">
              <option value="">Alle projecten</option>
              ${D.projecten.map((p) => `<option value="${esc(p.id)}"${S.proj === p.id ? " selected" : ""}>${esc(p.nr)} ${esc(p.naam)}</option>`).join("")}
            </select></label>
          ${ongepland}
        </aside>
        <div class="grid-wrap">
          <table class="plan">
            <thead><tr><th>Resource</th>${kop}</tr></thead>
            <tbody>${rijen}</tbody>
          </table>
        </div>
      </div>
      <div class="row legend">
        <span class="chip lg-vrij">Beschikbaar</span>
        <span class="chip lg-gep">Gepland</span>
        <span class="chip lg-vol">Volledig bezet</span>
        <span class="chip lg-over">Overgepland</span>
        <span class="chip lg-na">Niet beschikbaar / verlof</span>
      </div>
    </div>
  </section>`;
}

function viewInstellingen() {
  return `<section class="sec"><div class="panel sec">
    <h2 style="margin:0">Instellingen</h2>
    <form class="sec" data-form="settings">
      <label class="fld"><span>Titel</span><input name="titel" value="${esc(D.settings?.titel || "")}"></label>
      <div class="row"><button class="btn primary" type="submit">Opslaan</button></div>
    </form>
    <p class="note">De planner werkt nu met lokale demodata. Die blijft beschikbaar voor demo's, ook als BC is gekoppeld.</p>
    <h3 style="margin:14px 0 4px">Gegevensbron</h3>
    <div class="row">
      <button class="btn ${bcModus() ? "" : "primary"}" data-act="bron" data-bron="demo">Demodata</button>
      <button class="btn ${bcModus() ? "primary" : ""}" data-act="bron" data-bron="bc">Business Central</button>
    </div>
    <p class="note">${bcModus()
      ? "BC-modus is actief. Lokaal wordt niets weggeschreven, zodat de demodata intact blijft. De BC-data wordt nog niet geladen: het scherm toont tijdelijk de demodata, zonder wijzigingen op te slaan."
      : "Demodata is actief. Wijzigingen worden lokaal opgeslagen."}</p>
    <h3 style="margin:14px 0 4px">Business Central</h3>
    <p class="note">Test of de koppeling met de BC-extensie werkt. Dit leest alleen; er wordt niets gewijzigd.</p>
    <div class="row"><button class="btn" data-act="bctest">Test verbinding</button></div>
    <p id="bcStatus" class="note" aria-live="polite"></p>
  </div></section>`;
}

function viewTab() {
  if (S.tab === "instellingen") return viewInstellingen();
  if (S.tab === "gantt") return viewGantt();
  if (S.tab === "capaciteit") return viewCapaciteit();
  return viewPlanner();
}

/* ---------- Bezetting per week: horizon van 8 weken, met de projecten die op een resource concurreren ---------- */
function viewCapaciteit() {
  ensureData();
  const mon = maandag(S.week || undefined);
  const weken = Array.from({ length: 8 }, (_, i) => addDays(mon, i * 7));
  const kop = weken.map((w) => `<th>wk ${isoWeek(w)}<small>${kortDatum(w)}</small></th>`).join("");
  let rijen = "";
  for (const g of D.groepen) {
    rijen += `<tr class="grp"><td colspan="${weken.length + 1}">${esc(g)}</td></tr>`;
    for (const r of D.resources.filter((x) => x.groep === g)) {
      const cellen = weken.map((w) => {
        const dagen = [0, 1, 2, 3, 4].map((i) => addDays(w, i));
        const cap = dagen.reduce((a, d) => a + capFor(r.id, d), 0);
        const gep = dagen.reduce((a, d) => a + plannedFor(r.id, d), 0);
        const pct = cap > 0 ? Math.round((gep / cap) * 100) : null;
        const st = cap === 0 && gep === 0 ? "na" : gep > cap ? "over" : gep > 0 && gep === cap ? "vol" : gep > 0 ? "gep" : "vrij";
        const projecten = [...new Set(D.planning.filter((l) => l.resource === r.id && dagen.includes(l.datum))
          .map((l) => { const t = D.taken.find((x) => x.id === l.taak); const pr = t && D.projecten.find((x) => x.id === t.project); return pr ? pr.nr : ""; }).filter(Boolean))];
        return `<td class="cel s-${st}" data-week="${w}" title="${LABEL[st]}">
          <div class="cap-pct">${pct === null ? "–" : pct + "%"}</div>
          <small>${gep}/${cap}u</small>
          ${projecten.length ? `<small class="cap-pr">${esc(projecten.join(", "))}</small>` : ""}</td>`;
      }).join("");
      rijen += `<tr><th class="res">${esc(r.naam)}<small>${r.uren * 5}u per week</small></th>${cellen}</tr>`;
    }
  }
  const tekortRegels = [];
  for (const g of D.groepen) {
    const rs = D.resources.filter((x) => x.groep === g);
    weken.forEach((w) => {
      const dagen = [0, 1, 2, 3, 4].map((k) => addDays(w, k));
      const cap = rs.reduce((a, r) => a + dagen.reduce((b, d) => b + capFor(r.id, d), 0), 0);
      const gep = rs.reduce((a, r) => a + dagen.reduce((b, d) => b + plannedFor(r.id, d), 0), 0);
      if (gep > cap) tekortRegels.push(`⚠ ${esc(g)} heeft in week ${isoWeek(w)} een tekort van ${gep - cap} u capaciteit (${gep} u gepland, ${cap} u beschikbaar).`);
    });
  }
  const tekortHtml = tekortRegels.length
    ? `<p class="note" style="color:#b45309">${tekortRegels.join("<br>")}</p>`
    : `<p class="note">Geen tekorten in de komende 8 weken.</p>`;
  return `<section class="sec pl">
    <div class="panel sec">
      <div class="row pl-top">
        <button class="btn" data-act="capweek" data-d="-7">‹ Vorige</button>
        <button class="btn" data-act="capweek" data-d="0">Deze week</button>
        <button class="btn" data-act="capweek" data-d="7">Volgende ›</button>
        <b>8 weken vanaf ${kortDatum(weken[0])}</b>
        <span class="sp"></span>
        <span class="note">Klik op een week om die in de planning te bekijken</span>
      </div>
      ${printBalk("Bezetting per week")}
      ${tekortHtml}
      <div class="grid-wrap">
        <table class="plan cap">
          <thead><tr><th>Resource</th>${kop}</tr></thead>
          <tbody>${rijen}</tbody>
        </table>
      </div>
      <div class="row legend">
        <span class="chip lg-vrij">Onder 1%</span>
        <span class="chip lg-gep">Gepland</span>
        <span class="chip lg-vol">100%</span>
        <span class="chip lg-over">Over 100%</span>
        <span class="chip lg-na">Niet beschikbaar</span>
      </div>
    </div>
  </section>`;
}
const isoWeek = (s) => {
  const d = pYmd(s); const dag = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dag + 3);
  const jan4 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
};

/* ---------- Gantt: resource-weergave en project-weergave over vier weken ---------- */
const GW = 44, GLABEL = 280, GDAGEN = 28, GROWH = 30, GLANE = 24;
const DAGNAAM = ["zo", "ma", "di", "wo", "do", "vr", "za"];
function viewGantt() {
  ensureData();
  const mon = S.week || maandag();
  const dagen = Array.from({ length: GDAGEN }, (_, i) => addDays(mon, i));
  const xVan = (d) => GLABEL + dagen.indexOf(d) * GW;
  const breedte = GLABEL + GDAGEN * GW;
  const modus = S.gmode || "res";
  const KOPHOOGTE = 34; // de vaste kopregel bedekt de bovenste 34px, dus rijen beginnen daaronder
  let hoogte = KOPHOOGTE, inhoud = "", svg = "";

  const kopHtml = dagen.map((d, i) => {
    const wd = pYmd(d).getDay();
    return `<div class="g-day${wd === 0 || wd === 6 ? " we" : ""}" style="left:${GLABEL + i * GW}px;width:${GW}px">${DAGNAAM[wd]} ${pYmd(d).getDate()}</div>`;
  }).join("");

  if (modus === "res") {
    for (const g of D.groepen) {
      inhoud += `<div class="g-grp" style="top:${hoogte}px;width:${breedte}px">${esc(g)}</div>`; hoogte += 26;
      for (const r of D.resources.filter((x) => x.groep === g)) {
        const lijnen = D.planning.filter((l) => l.resource === r.id && dagen.includes(l.datum)).sort((a, b) => (a.datum < b.datum ? -1 : 1));
        const per = {};
        let lanes = 1;
        const balken = lijnen.map((l) => {
          const k = per[l.datum] || 0; per[l.datum] = k + 1; lanes = Math.max(lanes, k + 1);
          const t = D.taken.find((x) => x.id === l.taak), pr = t && D.projecten.find((x) => x.id === t.project);
          return `<div class="gbar" data-drag="plan" data-id="${esc(l.id)}" title="${esc(pr ? pr.nr : "")} · ${esc(t ? t.omschrijving : "")} · ${l.uren}u" style="left:${xVan(l.datum) + 2}px;top:${hoogte + 4 + k * GLANE}px;width:${GW - 4}px">${l.uren}u</div>`;
        }).join("");
        const h = lanes * GLANE + 8;
        const dropCellen = dagen.map((d, i) => `<div class="g-drop" data-drop="1" data-res="${esc(r.id)}" data-date="${d}" style="left:${GLABEL + i * GW}px;top:${hoogte}px;width:${GW}px;height:${h}px"></div>`).join("");
        inhoud += `<div class="g-lbl" style="top:${hoogte}px;height:${h}px">${esc(r.naam)}<small>${r.uren}u/dag</small></div>` +
          `<div class="g-lane" style="top:${hoogte}px;height:${h}px;left:${GLABEL}px;width:${GDAGEN * GW}px"></div>${dropCellen}${balken}`;
        hoogte += h;
      }
    }
  } else {
    const pijlen = [];
    const taakY = {};
    for (const pr of D.projecten) {
      inhoud += `<div class="g-grp" style="top:${hoogte}px;width:${breedte}px"><b>${esc(pr.nr)}</b> ${esc(pr.naam)}</div>`; hoogte += 26;
      for (const t of D.taken.filter((x) => x.project === pr.id)) {
        const y = hoogte;
        taakY[t.id] = y;
        const lijnen = D.planning.filter((l) => l.taak === t.id).map((l) => l.datum).sort();
        const vz = t.voorganger ? datumsVan(t.voorganger).slice(-1)[0] : null;
        const conflict = !!(vz && lijnen.length && lijnen[0] <= vz);
        const periode = lijnen.length ? `${kortDatum(lijnen[0])} – ${kortDatum(lijnen[lijnen.length - 1])}` : "niet gepland";
        inhoud += `<div class="g-lbl g-task-lbl" title="${esc(t.omschrijving)} · ${esc(t.groep)} · ${periode}" style="top:${y}px;height:${GROWH}px">${esc(t.omschrijving)}<small>${esc(t.groep)} · ${periode}${conflict ? " · ⚠ voorganger loopt uit" : ""}</small></div>`;
        if (lijnen.length) {
          const a = lijnen[0], b = lijnen[lijnen.length - 1];
          const first = dagen[0], last = dagen[dagen.length - 1];
          // Knip de balk tot het zichtbare bereik; buiten het bereik geen balk.
          if (b >= first && a <= last) {
            const s0 = a <= first ? 0 : dagen.findIndex((x) => x >= a);
            let e0 = 0;
            dagen.forEach((x, i) => { if (x <= b) e0 = i; });
            const x1 = GLABEL + s0 * GW + 2, x2 = GLABEL + (e0 + 1) * GW - 4;
            const gepl = geplandVan(t);
            inhoud += `<div class="g-task${conflict ? " g-conflict" : ""}" data-taak="${esc(t.id)}" title="${gepl}u van ${t.budget}u gepland · ${periode}" style="left:${x1}px;top:${y + 7}px;width:${Math.max(GW - 4, x2 - x1)}px">${gepl}/${t.budget}u</div>`;
            t._x = [x1, x2, y + 7 + 8];
          }
        }
        hoogte += GROWH;
      }
    }
    for (const t of D.taken) {
      if (!t.voorganger || !t._x || !D.taken.find((x) => x.id === t.voorganger && x._x)) continue;
      const v = D.taken.find((x) => x.id === t.voorganger);
      const x1 = v._x[1], y1 = v._x[2], x2 = t._x[0], y2 = t._x[2];
      pijlen.push(`<path d="M ${x1} ${y1} H ${x1 + 10} V ${y2} H ${x2}" />`);
    }
    svg = `<svg class="g-pijlen" width="${breedte}" height="${hoogte}"><defs><marker id="gpijl" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--muted)"/></marker></defs><g fill="none" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#gpijl)">${pijlen.join("")}</g></svg>`;
    for (const t of D.taken) delete t._x;
  }

  const hoogteTotaal = Math.max(hoogte, 120) + 40;
  return `<section class="sec pl">
    <div class="panel sec">
      <div class="row pl-top">
        <button class="btn" data-act="week" data-d="-28">‹ 4 weken</button>
        <button class="btn" data-act="week" data-d="0">Deze week</button>
        <button class="btn" data-act="week" data-d="28">4 weken ›</button>
        <b>${kortDatum(dagen[0])} t/m ${kortDatum(dagen[GDAGEN - 1])}</b>
        <span class="sp"></span>
        <div class="tabs">
          <button class="tab" data-act="gmode" data-m="res" aria-pressed="${modus === "res"}">Per resource</button>
          <button class="tab" data-act="gmode" data-m="proj" aria-pressed="${modus === "proj"}">Per project</button>
        </div>
      </div>
      ${printBalk(modus === "res" ? "Gantt per resource" : "Gantt per project")}
      <div class="grid-wrap">
        <div class="gantt" style="width:${breedte}px;height:${hoogteTotaal}px">
          <div class="g-kop" style="width:${breedte}px"><div class="g-day g-leeg" style="left:0;width:${GLABEL}px">${modus === "res" ? "Resource" : "Project / taak"}</div>${kopHtml}</div>
          ${inhoud}
          ${svg}
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- afdrukken ---------- */
function printBalk(titel) {
  const vandaag = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  return `<div class="row print-hide" style="justify-content:flex-end"><button class="btn" data-act="undo" title="Ctrl+Z">Ongedaan maken</button><button class="btn" data-act="print">Afdrukken</button></div>
    <h2 class="print-kop">${esc(D.settings?.titel || "BC Resource Planner")} · ${esc(titel)} · ${vandaag}</h2>`;
}

/* ---------- acties ---------- */
/* Capaciteitscontrole na elke wijziging: over- en niet-beschikbaar melden. */
function controleer(resId, datum) {
  const r = D.resources.find((x) => x.id === resId);
  if (!r) return;
  const st = status(r, datum);
  if (st === "over") toast(`${r.naam} is overgepland op ${kortDatum(datum)}: ${plannedFor(resId, datum)}u van ${capFor(resId, datum)}u.`, 5000);
  else if (st === "na") toast(`${r.naam} is niet beschikbaar op ${kortDatum(datum)}.`, 4000);
}

/* Afhankelijkheden: werkdagen en datums van een taak */
const isWerkdag = (s) => { const w = pYmd(s).getDay(); return w !== 0 && w !== 6; };
function werkdag(s, n) { let d = s, k = 0; while (k < n) { d = addDays(d, 1); if (isWerkdag(d)) k++; } return d; }
function werkdagenTussen(a, b) { let n = 0, d = a; while (d < b) { d = addDays(d, 1); if (isWerkdag(d)) n++; } return n; }
const datumsVan = (taakId) => D.planning.filter((l) => l.taak === taakId).map((l) => l.datum).sort();
const omschrijvingVan = (taakId) => (D.taken.find((x) => x.id === taakId) || {}).omschrijving || "";

/* Een blok van de opvolger mag niet vóór het einde van de voorganger beginnen. */
function voorgangerOk(t, datum) {
  if (!t.voorganger) return true;
  // Finish-to-start: de voorganger moet volledig zijn ingepland, anders is het einde onbekend.
  const vt = D.taken.find((x) => x.id === t.voorganger);
  if (vt && restUren(vt) > 0) { toast(`Plan eerst ${omschrijvingVan(t.voorganger)} volledig in (nog ${restUren(vt)}u open).`, 5000); return false; }
  const vd = datumsVan(t.voorganger);
  if (!vd.length) return true;
  if (datum <= vd[vd.length - 1]) { toast(`Plan na ${kortDatum(vd[vd.length - 1])}: eerst ${omschrijvingVan(t.voorganger)} af.`, 5000); return false; }
  return true;
}

/* Keten-preview: berekent het gevolg van een verplaatsing op een kopie van de planning.
   Er wordt niets opgeslagen. Per opvolger wordt elk blok apart gecontroleerd op capaciteit,
   verlof en deadline; een blok dat niet past blijft staan en krijgt een conflict. */
function previewKeten(taakId, wijzigingen) {
  const origineel = new Map(D.planning.map((l) => [l.id, { ...l }]));
  const shadow = D.planning.map((l) => ({ ...l }));
  const vrijOp = (resId, datum, uitgezonderd) =>
    capFor(resId, datum) - shadow.filter((x) => x.id !== uitgezonderd && x.resource === resId && x.datum === datum).reduce((a, x) => a + x.uren, 0);
  const lijnenVan = (tid) => shadow.filter((x) => x.taak === tid);
  const conflicten = [];
  const opvolgers = [];
  for (const w of wijzigingen) {
    const s = shadow.find((x) => x.id === w.id);
    if (!s) continue;
    s.datum = w.datum; s.resource = w.resource;
    if (w.uren !== undefined) s.uren = w.uren;
    if (vrijOp(s.resource, s.datum, s.id) < s.uren) {
      const r = D.resources.find((x) => x.id === s.resource);
      conflicten.push({ taak: D.taken.find((x) => x.id === s.taak), tekst: `${r ? r.naam : "Resource"} heeft op ${kortDatum(s.datum)} onvoldoende capaciteit voor ${s.uren}u.` });
    }
  }

  function volg(id, eind, pad) {
    for (const b of D.taken.filter((x) => x.voorganger === id)) {
      if (pad.includes(b.id)) { conflicten.push({ taak: b, tekst: `Circulaire afhankelijkheid bij ${b.omschrijving}.` }); continue; }
      const lijnen = lijnenVan(b.id);
      if (!lijnen.length) continue;
      const start = lijnen.map((l) => l.datum).sort()[0];
      if (start > eind) continue;
      const k = werkdagenTussen(start, werkdag(eind, 1 + (b.lag || 0)));
      for (const l of lijnen.sort((a, c) => (a.datum < c.datum ? 1 : -1))) {
        const nieuw = werkdag(l.datum, k);
        if (vrijOp(l.resource, nieuw, l.id) >= l.uren) {
          l.datum = nieuw;
        } else {
          const r = D.resources.find((x) => x.id === l.resource);
          conflicten.push({ taak: b, tekst: `${r ? r.naam : "Resource"} heeft op ${kortDatum(nieuw)} onvoldoende capaciteit voor ${l.uren}u; blok blijft op ${kortDatum(l.datum)}.` });
        }
      }
      const blijvend = lijnenVan(b.id).filter((l) => l.datum <= eind);
      if (blijvend.length) conflicten.push({ taak: b, tekst: `${b.omschrijving} kan niet starten na ${kortDatum(eind)}: ${blijvend.length} blok(ken) konden niet verschuiven.` });
      const nieuweEind = lijnenVan(b.id).map((l) => l.datum).sort().slice(-1)[0];
      if (b.deadline && nieuweEind > b.deadline) conflicten.push({ taak: b, tekst: `Deadline ${kortDatum(b.deadline)} wordt overschreden.` });
      const oudeStart = [...origineel.values()].filter((l) => l.taak === b.id).map((l) => l.datum).sort()[0];
      const nieuweStart = lijnenVan(b.id).map((l) => l.datum).sort()[0];
      opvolgers.push({ taak: b, oudeStart, nieuweStart, totaal: nieuweStart > oudeStart ? werkdagenTussen(oudeStart, nieuweStart) : 0, nieuweEind });
      volg(b.id, nieuweEind, [...pad, b.id]);
    }
  }

  const eind0 = lijnenVan(taakId).map((l) => l.datum).sort().slice(-1)[0];
  if (eind0) volg(taakId, eind0, [taakId]);

  const blokken = shadow.filter((s) => {
    const o = origineel.get(s.id);
    return o && (o.datum !== s.datum || o.resource !== s.resource || o.uren !== s.uren);
  }).map((s) => ({ id: s.id, datum: s.datum, resource: s.resource, uren: s.uren }));

  const projectIds = [...new Set(D.taken.filter((x) => x.id === taakId || opvolgers.some((o) => o.taak.id === x.id)).map((x) => x.project))];
  const projEind = (src, pid) => src.filter((l) => { const t = D.taken.find((x) => x.id === l.taak); return t && t.project === pid; }).map((l) => l.datum).sort().slice(-1)[0];
  const projecten = projectIds.map((pid) => {
    const p = D.projecten.find((x) => x.id === pid);
    return { naam: p ? `${p.nr} ${p.naam}` : pid, voor: projEind([...origineel.values()], pid), na: projEind(shadow, pid) };
  });

  return { blokken, opvolgers, conflicten, projecten };
}

function doorvoerenKeten(prev) {
  for (const c of prev.blokken) {
    const l = D.planning.find((x) => x.id === c.id);
    if (l) { l.datum = c.datum; l.resource = c.resource; if (c.uren !== undefined) l.uren = c.uren; }
  }
}

/* Voorstel: verdeel het restbudget over de resources van de groep, op vrije capaciteit per dag. */
function voorstel(taakId) {
  const t = D.taken.find((x) => x.id === taakId);
  if (!t) return null;
  const mon = S.week || maandag();
  let start = mon;
  const vd = datumsVan(t.voorganger);
  if (vd.length) { const na = werkdag(vd[vd.length - 1], 1); if (na > start) start = na; }
  const dagen = [];
  for (let i = 0; i < 14; i++) { const d = addDays(start, i); if (isWerkdag(d) && (!t.deadline || d <= t.deadline)) dagen.push(d); }
  const kandidaten = D.resources.filter((r) => r.groep === t.groep);
  const regels = [];
  let rest = restUren(t);
  for (const d of dagen) for (const r of kandidaten) {
    if (rest <= 0) break;
    const reeds = regels.filter((x) => x.resource === r.id && x.datum === d).reduce((a, x) => a + x.uren, 0);
    const vrij = capFor(r.id, d) - plannedFor(r.id, d) - reeds;
    if (vrij <= 0) continue;
    const uren = Math.min(rest, vrij);
    regels.push({ taak: t.id, resource: r.id, datum: d, uren });
    rest -= uren;
  }
  return { t, regels, restNa: rest };
}

function planTaak(taakId, resId, datum) {
  const t = D.taken.find((x) => x.id === taakId), r = D.resources.find((x) => x.id === resId);
  if (!t || !r) return;
  if (t.groep !== r.groep) { toast(`${t.groep}-werk kan niet naar ${r.naam} (${r.groep}).`, 4000); return; }
  if (!voorgangerOk(t, datum)) return;
  if (capFor(r.id, datum) <= 0) { toast(`${r.naam} is niet beschikbaar op ${kortDatum(datum)} (verlof).`, 4000); return; }
  const rest = restUren(t);
  if (rest <= 0) { toast("Deze taak is al volledig ingepland."); return; }
  const vrij = capFor(r.id, datum) - plannedFor(r.id, datum);
  const uren = Math.min(rest, vrij > 0 ? vrij : r.uren);
  D.planning.push({ id: uid(), taak: t.id, resource: r.id, datum, uren, status: "Gepland" });
  controleer(r.id, datum);
  save();
}

/* Verplaatsen: eerst berekenen (preview), pas na bevestiging opslaan. */
function verplaatsPlan(id, resId, datum) {
  const l = D.planning.find((x) => x.id === id);
  if (!l || (l.resource === resId && l.datum === datum)) return;
  const t = D.taken.find((x) => x.id === l.taak), r = D.resources.find((x) => x.id === resId);
  if (!t || !r) return;
  if (t.groep !== r.groep) { toast(`${t.groep}-werk kan niet naar ${r.naam} (${r.groep}).`, 4000); return; }
  if (capFor(resId, datum) <= 0) { toast(`${r.naam} is niet beschikbaar op ${kortDatum(datum)} (verlof).`, 4000); return; }
  if (!voorgangerOk(t, datum)) return;
  const prev = previewKeten(t.id, [{ id, datum, resource: resId }]);
  if (!prev.blokken.length && !prev.conflicten.length) {
    l.resource = resId; l.datum = datum;
    controleer(resId, datum);
    save();
    return;
  }
  toonKetenPreview(t, prev, () => {
    doorvoerenKeten(prev);
    controleer(resId, datum);
    save();
  });
}

/* Dialoog met het totale gevolg van een wijziging. Niets is opgeslagen tot "Accepteren". */
function toonKetenPreview(t, prev, bevestig) {
  const p = D.projecten.find((x) => x.id === t.project);
  const regels = prev.opvolgers.map((o) => {
    const extra = o.totaal ? `+${o.totaal} werkdag${o.totaal === 1 ? "" : "en"} (start ${kortDatum(o.nieuweStart)})` : "geen verschuiving";
    return `<tr><td>${esc(o.taak.omschrijving)}</td><td>${extra}</td></tr>`;
  }).join("");
  const proj = prev.projecten.map((x) => `<p class="note">${esc(x.naam)}: einddatum ${x.voor ? kortDatum(x.voor) : "-"} → ${x.na ? kortDatum(x.na) : "-"}</p>`).join("");
  const conf = prev.conflicten.map((c) => `<p class="note" style="color:#b45309">⚠ ${esc(c.tekst)}</p>`).join("");
  let ov = document.getElementById("detailModal");
  if (!ov) { ov = document.createElement("div"); ov.id = "detailModal"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
    <h3>Wijziging: ${esc(p ? p.nr : "")} · ${esc(t.omschrijving)}</h3>
    ${regels ? `<table class="voor"><thead><tr><th>Taak</th><th>Gevolg</th></tr></thead><tbody>${regels}</tbody></table>` : '<p class="note">Geen opvolgende taken worden geraakt.</p>'}
    ${proj}
    <p class="note">${prev.blokken.length} planningblok${prev.blokken.length === 1 ? "" : "ken"} worden gewijzigd.</p>
    ${conf}
    <p class="note">Er wordt niets opgeslagen tot je accepteert.</p>
    <div id="ketenUitleg" class="note"></div>
    <div class="dlg-foot"><button class="btn" id="ketenUitlegKnop" ${prev.conflicten.length ? "" : "disabled"}>Uitleg</button><span class="sp"></span><button class="btn" id="ketenNee">Annuleren</button><button class="btn primary" id="ketenJa">Accepteren</button></div></div>`;
  ov.hidden = false;
  const sluit = () => { ov.hidden = true; ov.innerHTML = ""; };
  document.getElementById("ketenNee").onclick = sluit;
  ov.onclick = (e) => { if (e.target === ov) sluit(); };
  document.getElementById("ketenJa").onclick = () => { sluit(); bevestig(); };
  document.getElementById("ketenUitlegKnop").onclick = async () => {
    const uitleg = document.getElementById("ketenUitleg");
    uitleg.textContent = "Uitleg wordt opgesteld…";
    // Geen namen naar buiten: resourcenamen worden vervangen door de groep.
    const anoniem = prev.conflicten.map((c) => {
      let tekst = c.tekst;
      for (const r of D.resources) if (r.naam) tekst = tekst.split(r.naam).join(`resource ${r.groep}`);
      return tekst;
    });
    try {
      const d = await api("/api/uitleg", { method: "POST", body: JSON.stringify({ conflicten: anoniem }) });
      const label = d.bron === "ai" ? "Uitleg door AI" : `Vaste uitleg. Reden: ${esc(d.fout || "onbekend")}`;
      uitleg.innerHTML = `<p>${esc(d.tekst).replace(/\n/g, "<br>")}</p><small>${label}</small>`;
    } catch (e) {
      uitleg.textContent = "Uitleg is niet beschikbaar: " + (typeof apiErr === "function" ? apiErr(e) : "geen verbinding.");
    }
  };
}

/* Uren van een blok met 1 uur verhogen of verlagen. Het restbudget volgt vanzelf. */
function wijzigUren(id, delta) {
  const l = D.planning.find((x) => x.id === id);
  const t = l && D.taken.find((x) => x.id === l.taak);
  if (!l || !t) return;
  if (delta > 0 && restUren(t) <= 0) { toast("Er is geen restbudget meer voor deze taak."); return; }
  if (delta > 0 && capFor(l.resource, l.datum) <= 0) { toast("Deze resource is op deze dag niet beschikbaar (verlof)."); return; }
  if (l.uren + delta < 1) return;
  const nieuweUren = l.uren + delta;
  const prev = previewKeten(t.id, [{ id, datum: l.datum, resource: l.resource, uren: nieuweUren }]);
  if (!prev.blokken.length && !prev.conflicten.length) {
    l.uren = nieuweUren;
    controleer(l.resource, l.datum);
    save();
    return;
  }
  toonKetenPreview(t, prev, () => {
    doorvoerenKeten(prev);
    controleer(l.resource, l.datum);
    save();
  });
}

/* Details van een blok in een dialoog. */
function toonDetail(id) {
  const l = D.planning.find((x) => x.id === id);
  const t = l && D.taken.find((x) => x.id === l.taak);
  if (!l || !t) return;
  const p = D.projecten.find((x) => x.id === t.project);
  const r = D.resources.find((x) => x.id === l.resource);
  let ov = document.getElementById("detailModal");
  if (!ov) { ov = document.createElement("div"); ov.id = "detailModal"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="detT">
    <h3 id="detT">${esc(p ? p.nr : "")} · ${esc(t.omschrijving)}</h3>
    <p class="note">${esc(p ? p.naam : "")}</p>
    <dl class="kv">
      <dt>Groep</dt><dd>${esc(t.groep)}</dd>
      <dt>Resource</dt><dd>${esc(r ? r.naam : "")}</dd>
      <dt>Datum</dt><dd>${kortDatum(l.datum)}</dd>
      <dt>Gepland op dit blok</dt><dd>${l.uren}u</dd>
      <dt>Status</dt><dd>${statusVan(l)}</dd>
      <dt>Projectbudget</dt><dd>${t.budget}u</dd>
      <dt>Totaal gepland</dt><dd>${geplandVan(t)}u</dd>
      <dt>Gerealiseerd</dt><dd>${t.gerealiseerd || 0}u</dd>
      <dt>Nog te plannen</dt><dd>${restUren(t)}u</dd>
      <dt>Signaal</dt><dd>${signaal(t)}</dd>
      <dt>Prognosebron</dt><dd>${prognoseBron(t)}</dd>
      ${t.voorganger ? `<dt>🔗 Afhankelijk van</dt><dd>${esc(omschrijvingVan(t.voorganger))}</dd>` : ""}
      ${t.voorganger && datumsVan(t.voorganger).length && l.datum <= datumsVan(t.voorganger).slice(-1)[0] ? `<dt>⚠ Voorganger loopt uit</dt><dd>eerst ${kortDatum(datumsVan(t.voorganger).slice(-1)[0])} af</dd>` : ""}
    </dl>
    <div class="dlg-foot">${statusVan(l) !== "Bevestigd" && telt(l) ? '<button class="btn" id="detailBevestig">Bevestigen</button>' : ""}${telt(l) ? '<button class="btn" id="detailAnnuleer">Planning annuleren</button>' : ""}<span class="sp"></span><button class="btn primary" id="detailSluit">Sluiten</button></div></div>`;
  ov.hidden = false;
  const sluit = () => { ov.hidden = true; ov.innerHTML = ""; };
  const zet = (st) => { const x = D.planning.find((q) => q.id === l.id); if (x) x.status = st; sluit(); save(); };
  const bev = document.getElementById("detailBevestig"); if (bev) bev.onclick = () => zet("Bevestigd");
  const ann = document.getElementById("detailAnnuleer"); if (ann) ann.onclick = () => zet("Geannuleerd");
  document.getElementById("detailSluit").onclick = sluit;
  ov.onclick = (e) => { if (e.target === ov) sluit(); };
}

/* Taakdetail vanuit de Gantt: budget, planning, afhankelijkheid en resourceverdeling. */
function toonTaakDetail(taakId) {
  const t = D.taken.find((x) => x.id === taakId);
  if (!t) return;
  const p = D.projecten.find((x) => x.id === t.project);
  const lijnen = D.planning.filter((l) => l.taak === taakId).sort((a, b) => (a.datum < b.datum ? -1 : 1));
  const gepl = geplandVan(t);
  const perRes = {};
  for (const l of lijnen) perRes[l.resource] = (perRes[l.resource] || 0) + l.uren;
  const resRegels = Object.entries(perRes).map(([id, u]) => { const r = D.resources.find((x) => x.id === id); return `<li>${esc(r ? r.naam : id)}: ${u} u</li>`; }).join("") || "<li>Nog niet ingepland</li>";
  const start = lijnen.length ? lijnen[0].datum : null, eind = lijnen.length ? lijnen[lijnen.length - 1].datum : null;
  const vz = t.voorganger ? datumsVan(t.voorganger).slice(-1)[0] : null;
  const conflict = !!(vz && start && start <= vz);
  let ov = document.getElementById("detailModal");
  if (!ov) { ov = document.createElement("div"); ov.id = "detailModal"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
    <h3>${esc(p ? p.nr : "")} · ${esc(t.omschrijving)}</h3>
    <p class="note">${esc(p ? p.naam : "")}</p>
    <dl class="kv">
      <dt>Resourcegroep</dt><dd>${esc(t.groep)}</dd>
      <dt>Budget</dt><dd>${t.budget} u</dd>
      <dt>Gepland</dt><dd>${gepl} u</dd>
      <dt>Nog te plannen</dt><dd>${restUren(t)} u</dd>
      <dt>Signaal</dt><dd>${signaal(t)}</dd>
      <dt>Prognosebron</dt><dd>${prognoseBron(t)}</dd>
      <dt>Gerealiseerd</dt><dd>${t.gerealiseerd || 0} u</dd>
      <dt>Start</dt><dd>${start ? kortDatum(start) : "–"}</dd>
      <dt>Verwacht einde</dt><dd>${eind ? kortDatum(eind) : "–"}</dd>
      ${t.deadline ? `<dt>Deadline</dt><dd>${kortDatum(t.deadline)}</dd>` : ""}
    </dl>
    <h4 class="note">Afhankelijkheid</h4>
    <dl class="kv">
      <dt>${t.voorganger ? "🔗 Voorganger" : "Voorganger"}</dt><dd>${t.voorganger ? esc(omschrijvingVan(t.voorganger)) : "geen"}</dd>
      ${t.voorganger ? `<dt>Type</dt><dd>Finish-to-Start</dd><dt>Wachttijd</dt><dd>${t.lag || 0} werkdagen</dd>` : ""}
    </dl>
    ${conflict ? `<p class="note" style="color:#b45309">⚠ Voorganger loopt uit: eerst ${kortDatum(vz)} af.</p>` : ""}
    <h4 class="note">Resourceplanning</h4>
    <ul>${resRegels}</ul>
    <div class="dlg-foot"><button class="btn" id="taakNaarPlanning">Naar planning</button><span class="sp"></span><button class="btn primary" id="taakSluit">Sluiten</button></div></div>`;
  ov.hidden = false;
  const sluit = () => { ov.hidden = true; ov.innerHTML = ""; };
  document.getElementById("taakSluit").onclick = sluit;
  document.getElementById("taakNaarPlanning").onclick = () => {
    sluit();
    S.tab = "overzicht";
    S.week = start ? maandag(start) : null;
    render();
  };
  ov.onclick = (e) => { if (e.target === ov) sluit(); };
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-act='undo']")) { undo(); return; }
}); 
document.addEventListener("change", (e) => {
  if (e.target.dataset && e.target.dataset.act === "projfilter") { S.proj = e.target.value || null; render(); }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act='bron']");
  if (!b) return;
  D.settings = D.settings || {};
  D.settings.bron = b.dataset.bron === "bc" ? "bc" : "demo";
  pushState();   // alleen de keuze zelf wordt opgeslagen; de demodata blijft gelijk
  render();
});
document.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-act='bctest']")) return;
  const st = document.getElementById("bcStatus");
  if (st) st.textContent = "Verbinding testen…";
  try {
    const d = await api("/api/bc/afhankelijkheden");
    const n = (d.items || []).length;
    if (st) st.textContent = `Verbonden met Business Central: ${n} afhankelijkheid${n === 1 ? "" : "heden"} gevonden.`;
  } catch (err) {
    if (st) st.textContent = "Geen verbinding: " + (typeof apiErr === "function" ? apiErr(err) : "onbekende fout") + ". Controleer de omgevingsvariabelen.";
  }
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.target.closest("input, textarea, [contenteditable]")) {
    e.preventDefault(); undo();
  }
});
let suppressClick = false;
document.addEventListener("click", (e) => {
  if (suppressClick) { suppressClick = false; return; }
  const kies = e.target.closest("#ctxMenu [data-taak]");
  if (kies) { hideCtx(); planTaak(kies.dataset.taak, kies.dataset.res, kies.dataset.date); return; }
  if (!e.target.closest("#ctxMenu")) hideCtx();
  const b = e.target.closest("[data-act='week'], [data-act='plandel'], [data-act='minu'], [data-act='plusu'], [data-act='voorstel'], [data-act='gmode'], [data-act='capweek'], [data-act='print']");
  if (b) {
    const a = b.dataset.act;
    if (a === "week") {
      const n = Number(b.dataset.d);
      S.week = n ? addDays(S.week || maandag(), n) : maandag();
      render(); return;
    }
    if (a === "print") { window.print(); return; }
    if (a === "gmode") { S.gmode = b.dataset.m; render(); return; }
    if (a === "capweek") { const n = Number(b.dataset.d); S.week = n ? addDays(maandag(S.week || undefined), n) : maandag(); render(); return; }
    if (a === "voorstel") { toonVoorstel(b.dataset.id); return; }
    if (a === "minu") { wijzigUren(b.dataset.id, -1); return; }
    if (a === "plusu") { wijzigUren(b.dataset.id, 1); return; }
    D.planning = D.planning.filter((x) => x.id !== b.dataset.id);
    save(); return;
  }
  const cap = e.target.closest("table.cap td.cel");
  if (cap) { S.week = cap.dataset.week; S.tab = "overzicht"; render(); return; }
  const gt = e.target.closest(".g-task");
  if (gt && gt.dataset.taak) { toonTaakDetail(gt.dataset.taak); return; }
  const blk = e.target.closest(".blk, .gbar");
  if (blk && blk.dataset.id) toonDetail(blk.dataset.id);
});

function toonVoorstel(taakId) {
  const v = voorstel(taakId);
  if (!v) return;
  const t = v.t;
  const regels = v.regels;
  const rijen = regels.length
    ? regels.map((x) => { const r = D.resources.find((y) => y.id === x.resource); return `<tr><td>${kortDatum(x.datum)}</td><td>${esc(r ? r.naam : "")}</td><td>${x.uren}u</td></tr>`; }).join("")
    : '<tr><td colspan="3">Geen vrije capaciteit in deze periode.</td></tr>';
  let ov = document.getElementById("detailModal");
  if (!ov) { ov = document.createElement("div"); ov.id = "detailModal"; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
    <h3>Voorstel: ${esc(t.omschrijving)}</h3>
    <p class="note">${esc(t.groep)} · ${restUren(t)}u nog te plannen${t.deadline ? ` · deadline ${kortDatum(t.deadline)}` : ""}${t.voorganger ? ` · na ${esc(omschrijvingVan(t.voorganger))}` : ""}</p>
    <table class="voor"><thead><tr><th>Datum</th><th>Resource</th><th>Uren</th></tr></thead><tbody>${rijen}</tbody></table>
    <p class="note">${v.restNa > 0 ? `Er blijft ${v.restNa}u over zonder plek.` : "Het hele restbudget past in dit voorstel."}</p>
    <div class="dlg-foot"><span class="sp"></span><button class="btn" id="voorNee">Annuleren</button><button class="btn primary" id="voorJa" ${regels.length ? "" : "disabled"}>Accepteren</button></div></div>`;
  ov.hidden = false;
  const sluit = () => { ov.hidden = true; ov.innerHTML = ""; };
  document.getElementById("voorNee").onclick = sluit;
  ov.onclick = (e) => { if (e.target === ov) sluit(); };
  document.getElementById("voorJa").onclick = () => {
    for (const x of regels) D.planning.push({ id: uid(), taak: x.taak, resource: x.resource, datum: x.datum, uren: x.uren, status: "Voorstel" });
    sluit();
    controleer(regels[0].resource, regels[0].datum);
    save();
  };
}

/* Slepen met de muis: werkt zonder de native drag van de browser. */
let PD = null;
const cellAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest("[data-drop]"); };
const clearHL = () => document.querySelectorAll(".cel.dropov").forEach((c) => c.classList.remove("dropov"));

document.addEventListener("pointerdown", (e) => {
  suppressClick = false;
  if (e.button !== 0 || e.target.closest("button")) return;
  const el = e.target.closest("[data-drag]");
  if (!el) return;
  PD = { type: el.dataset.drag, id: el.dataset.id, x: e.clientX, y: e.clientY, moved: false, label: el.textContent.trim().replace(/\s+/g, " ").slice(0, 60) };
});
document.addEventListener("pointermove", (e) => {
  if (!PD) return;
  if (!PD.moved) {
    if (Math.hypot(e.clientX - PD.x, e.clientY - PD.y) < 6) return;
    PD.moved = true;
    PD.ghost = document.createElement("div");
    PD.ghost.className = "ghost";
    PD.ghost.textContent = PD.label;
    document.body.appendChild(PD.ghost);
    document.body.classList.add("sleep");
  }
  PD.ghost.style.left = e.clientX + 14 + "px";
  PD.ghost.style.top = e.clientY + 14 + "px";
  clearHL();
  const c = cellAt(e.clientX, e.clientY);
  if (c) c.classList.add("dropov");
});
document.addEventListener("pointerup", (e) => {
  if (!PD) return;
  const d = PD; PD = null;
  if (d.ghost) d.ghost.remove();
  document.body.classList.remove("sleep");
  clearHL();
  if (!d.moved) return;
  suppressClick = true;
  const c = cellAt(e.clientX, e.clientY);
  if (!c) return;
  if (d.type === "taak") planTaak(d.id, c.dataset.res, c.dataset.date);
  else verplaatsPlan(d.id, c.dataset.res, c.dataset.date);
});

/* Rechtermuisknop op een cel: kies een ongeplande taak voor deze resource en dag. */
function hideCtx() { const m = document.getElementById("ctxMenu"); if (m) m.remove(); }
function toonCtx(x, y, resId, datum) {
  hideCtx();
  const r = D.resources.find((q) => q.id === resId);
  if (!r) return;
  const opties = D.taken.filter((t) => t.groep === r.groep && restUren(t) > 0);
  const p = (id) => (D.projecten.find((q) => q.id === id) || {}).nr || "";
  const items = (opties.length
    ? opties.map((t) => `<button data-taak="${esc(t.id)}" data-res="${esc(resId)}" data-date="${datum}">${esc(p(t.project))} · ${esc(t.omschrijving)}<small>nog ${restUren(t)}u${t.voorganger ? " · na " + esc(omschrijvingVan(t.voorganger)) : ""}</small></button>`).join("")
    : '<p class="note" style="padding:8px 10px">Geen ongeplande taken voor deze groep.</p>');
  const m = document.createElement("div");
  m.id = "ctxMenu";
  m.innerHTML = `<div class="kop">Inplannen op ${kortDatum(datum)} · ${esc(r.naam)}</div>${items}`;
  document.body.appendChild(m);
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.min(x, window.innerWidth - w - 8) + "px";
  m.style.top = Math.min(y, window.innerHeight - h - 8) + "px";
}
/* Rechtermuisknop op een taak in Ongepland: kies resource en dag van de huidige week. */
function toonTaakCtx(x, y, taakId) {
  hideCtx();
  const t = D.taken.find((q) => q.id === taakId);
  if (!t || restUren(t) <= 0) return;
  const mon = S.week || maandag();
  const dagen = [0, 1, 2, 3, 4].map((i) => addDays(mon, i));
  const rijen = [];
  for (const r of D.resources.filter((q) => q.groep === t.groep)) for (const d of dagen) {
    const vrij = capFor(r.id, d) - plannedFor(r.id, d);
    if (vrij <= 0) continue;
    rijen.push(`<button data-taak="${esc(t.id)}" data-res="${esc(r.id)}" data-date="${d}">${esc(r.naam)} · ${kortDatum(d)}<small>${vrij}u vrij</small></button>`);
  }
  const m = document.createElement("div");
  m.id = "ctxMenu";
  m.innerHTML = `<div class="kop">Inplannen: ${esc(t.omschrijving)} (nog ${restUren(t)}u)</div>${rijen.length ? rijen.join("") : '<p class="note" style="padding:8px 10px">Geen vrije plek deze week in deze groep.</p>'}`;
  document.body.appendChild(m);
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.min(x, window.innerWidth - w - 8) + "px";
  m.style.top = Math.min(y, window.innerHeight - h - 8) + "px";
}
document.addEventListener("contextmenu", (e) => {
  const taak = e.target.closest("[data-drag='taak']");
  if (taak) { e.preventDefault(); toonTaakCtx(e.clientX, e.clientY, taak.dataset.id); return; }
  const c = e.target.closest("[data-drop]");
  if (!c) { hideCtx(); return; }
  e.preventDefault();
  toonCtx(e.clientX, e.clientY, c.dataset.res, c.dataset.date);
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideCtx(); });
