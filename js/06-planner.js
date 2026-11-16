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

const DEMO_VERSIE = 2;

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
    ],
    projecten: [
      { id: "p1", nr: "P2026-031", naam: "Woningbouw Hoogkerk: kozijnen en deuren" },
      { id: "p2", nr: "P2026-034", naam: "Kantoor Zwolle: vliesgevel" },
      { id: "p3", nr: "P2026-037", naam: "Serre Apeldoorn" },
    ],
    taken: [
      { id: "t1", project: "p1", groep: "Ontwerp", omschrijving: "Opname en tekeningen", budget: 16 },
      { id: "t2", project: "p1", groep: "Productie", omschrijving: "Kozijnen en deuren fabriceren", budget: 48 },
      { id: "t3", project: "p1", groep: "Montage", omschrijving: "Montage op bouwplaats", budget: 24 },
      { id: "t4", project: "p2", groep: "Ontwerp", omschrijving: "Vliesgevel ontwerp", budget: 40 },
      { id: "t5", project: "p2", groep: "Productie", omschrijving: "Vliesgevel fabriceren", budget: 80 },
      { id: "t6", project: "p3", groep: "Montage", omschrijving: "Serre plaatsen en afdichten", budget: 24 },
      { id: "t7", project: "p3", groep: "Ontwerp", omschrijving: "Serre ontwerp", budget: 12 },
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
    ],
    verlof: [{ id: "v1", resource: "r3", datum: d(2), uren: 8 }],
  };
}

/* Demodata zetten als de data op de server ontbreekt of van een oudere versie is. */
function ensureData() {
  if (D.versie !== DEMO_VERSIE) { Object.assign(D, demo(maandag())); pushState(); }
}
ensureData();

/* ---------- rekenregels ---------- */
const plannedFor = (res, datum) => D.planning.filter((l) => l.resource === res && l.datum === datum).reduce((a, l) => a + l.uren, 0);
const verlofFor = (res, datum) => D.verlof.filter((v) => v.resource === res && v.datum === datum).reduce((a, v) => a + v.uren, 0);
const capFor = (resId, datum) => { const r = D.resources.find((x) => x.id === resId); return r ? Math.max(0, r.uren - verlofFor(resId, datum)) : 0; };
const restUren = (t) => t.budget - D.planning.filter((l) => l.taak === t.id).reduce((a, l) => a + l.uren, 0);
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
  return `<div class="blk" draggable="true" data-drag="plan" data-id="${esc(l.id)}">
    <span>${esc(p ? p.nr : "")} · ${esc(t ? t.omschrijving : "")}</span><b>${l.uren}u</b>
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
    const ts = D.taken.filter((t) => t.project === p.id && restUren(t) > 0);
    if (!ts.length) continue;
    ongepland += `<div class="pj"><b>${esc(p.nr)}</b> <span>${esc(p.naam)}</span>` +
      ts.map((t) => {
        const nog = restUren(t); totaalNog += nog;
        return `<div class="taak" draggable="true" data-drag="taak" data-id="${esc(t.id)}">
          <span>${esc(t.omschrijving)} <small>${esc(t.groep)}</small></span>
          <span class="nu">nog ${nog}u</span>
          <small class="meta">budget ${t.budget}u · gepland ${t.budget - nog}u</small></div>`;
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
      <div class="pl-wrap">
        <aside class="ong">
          <h3>Ongepland</h3>
          <p class="note">Sleep een taak naar een cel. Er wordt het resterende budget gepland, tot maximaal de dagcapaciteit.</p>
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
    <p class="note">Later hier: de BC-omgeving en de bron voor verlof en capaciteit.</p>
  </div></section>`;
}

function viewTab() {
  if (S.tab === "instellingen") return viewInstellingen();
  return viewPlanner();
}

/* ---------- acties ---------- */
function planTaak(taakId, resId, datum) {
  const t = D.taken.find((x) => x.id === taakId), r = D.resources.find((x) => x.id === resId);
  if (!t || !r) return;
  const rest = restUren(t);
  if (rest <= 0) { toast("Deze taak is al volledig ingepland."); return; }
  const vrij = capFor(r.id, datum) - plannedFor(r.id, datum);
  const uren = Math.min(rest, vrij > 0 ? vrij : r.uren);
  D.planning.push({ id: uid(), taak: t.id, resource: r.id, datum, uren });
  if (t.groep !== r.groep) toast(`${r.naam} zit in ${r.groep}; de taak is ${t.groep}. Toch ingepland.`, 5000);
  else if (plannedFor(r.id, datum) > capFor(r.id, datum)) toast(`${r.naam} is overgepland op ${kortDatum(datum)}.`, 5000);
  save();
}
function verplaatsPlan(id, resId, datum) {
  const l = D.planning.find((x) => x.id === id);
  if (!l || (l.resource === resId && l.datum === datum)) return;
  l.resource = resId; l.datum = datum;
  if (plannedFor(resId, datum) > capFor(resId, datum)) toast("Let op: deze resource is overgepland op die dag.", 4000);
  save();
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act='week'], [data-act='plandel']");
  if (!b) return;
  if (b.dataset.act === "week") {
    const n = Number(b.dataset.d);
    S.week = n ? addDays(S.week || maandag(), n) : maandag();
    render(); return;
  }
  D.planning = D.planning.filter((x) => x.id !== b.dataset.id);
  save();
});

let DRAG = null;
const clearHL = () => document.querySelectorAll(".cel.dropov").forEach((c) => c.classList.remove("dropov"));
document.addEventListener("dragstart", (e) => {
  const el = e.target.closest("[data-drag]"); if (!el) return;
  DRAG = { type: el.dataset.drag, id: el.dataset.id };
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", el.dataset.id || "");
});
document.addEventListener("dragover", (e) => {
  const c = e.target.closest("[data-drop]"); if (!c || !DRAG) return;
  e.preventDefault(); e.dataTransfer.dropEffect = "move";
  if (!c.classList.contains("dropov")) { clearHL(); c.classList.add("dropov"); }
});
document.addEventListener("drop", (e) => {
  const c = e.target.closest("[data-drop]"); if (!c || !DRAG) return;
  e.preventDefault();
  const d = DRAG; DRAG = null; clearHL();
  if (d.type === "taak") planTaak(d.id, c.dataset.res, c.dataset.date);
  else verplaatsPlan(d.id, c.dataset.res, c.dataset.date);
});
document.addEventListener("dragend", () => { DRAG = null; clearHL(); });
