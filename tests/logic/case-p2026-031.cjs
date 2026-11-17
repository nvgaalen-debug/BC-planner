// Controle van de praktijkcase P2026-031 (standaard BC, geen maatwerk) op de demodata en de scenario's.
// Draaien vanuit de projectmap: node tests/logic/case-p2026-031.cjs
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16", proj:null}, toast(){}, render(){}, save(){}, pushState(){} };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
const r = JSON.parse(vm.runInContext(`
  ensureData();
  const p1 = () => D.taken.filter((t) => t.project === "p1");
  const byNr = (nr) => D.taken.find((t) => t.project === "p1" && t.omschrijving.startsWith(nr));
  const out = {};
  out.aantalP1 = p1().length;
  out.montageRest = restUren(D.taken.find((t) => t.id === "t24"));
  out.montageSignaal = signaal(D.taken.find((t) => t.id === "t24"));
  out.montageGepl = geplandVan(D.taken.find((t) => t.id === "t24"));
  out.open = p1().filter((t) => t.id !== "t24").map((t) => restUren(t));
  // Scenario 1 (case stap 5): BC-hoeveelheid 24 -> 32, 16 geboekt => remaining 16. Op dit moment staat 8 uur toekomstig gepland.
  const m = D.taken.find((t) => t.id === "t24");
  D.planning = D.planning.filter((l) => l.id !== "l20" && l.id !== "l21");
  m.remaining = 32 - 16; m.gerealiseerd = 16;
  out.scen1Gepl = geplandVan(m);
  out.scen1Rest = restUren(m);
  out.scen1Signaal = signaal(m);
  // Scenario 2 (case stap 8): BC-remaining 8, toekomstig 16 uur gepland => overplanning
  m.remaining = 8; m.gerealiseerd = 24;
  D.planning.push({ id: "extra1", taak: "t24", resource: "r10", datum: "2026-12-03", uren: 8, status: "Gepland" });
  out.scen2Gepl = geplandVan(m);
  out.scen2Signaal = signaal(m);
  JSON.stringify(out);
`, ctx));
assert.strictEqual(r.aantalP1, 5, "P2026-031 heeft 5 taken uit de case");
assert.strictEqual(r.montageRest, 0, "montage 4000: 24 gepland tegen 24 nodig");
assert.strictEqual(r.montageSignaal, "Planning dekkend");
assert.strictEqual(r.montageGepl, 24);
assert.deepStrictEqual(r.open, [16, 24, 80, 8], "taken 1000, 2000, 3000 en 5000 staan open in Ongepland");
assert.strictEqual(r.scen1Gepl, 8, "scenario stap 5: 8 uur toekomstig gepland");
assert.strictEqual(r.scen1Rest, 8, "remaining 16 - gepland 8 = 8 nog te plannen");
assert.strictEqual(r.scen1Signaal, "Extra werk plannen");
assert.strictEqual(r.scen2Gepl, 16, "scenario stap 8: 8 + 8 toekomstig gepland");
assert.strictEqual(r.scen2Signaal, "Te veel gepland", "remaining 8 tegenover 16 gepland");
console.log("case-p2026-031: alle asserts geslaagd", r);
