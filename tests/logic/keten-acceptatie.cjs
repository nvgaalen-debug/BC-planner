// Regressietest voor de afhankelijkheidslogica (acceptatietest uit de spec, P2026-031).
// Draaien vanuit de projectmap: node tests/logic/keten-acceptatie.cjs
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, BroadcastChannel: undefined, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16"}, toast(){}, render(){}, save(){ ctx.saves++; }, saves:0 };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});

function scenario(verlof) {
  return vm.runInContext(`
    ensureData();
    D.groepen = ["Ontwerp","Productie","Montage"];
    D.resources = [{id:"lisa",naam:"Lisa",groep:"Ontwerp",uren:8},{id:"ruud",naam:"Ruud",groep:"Productie",uren:8},{id:"jeroen",naam:"Jeroen",groep:"Montage",uren:8}];
    D.projecten = [{id:"p",nr:"P2026-031",naam:"Test"}];
    D.taken = [
      {id:"o",project:"p",groep:"Ontwerp",omschrijving:"Ontwerp",budget:40},
      {id:"p2",project:"p",groep:"Productie",omschrijving:"Productie",budget:40,voorganger:"o"},
      {id:"m",project:"p",groep:"Montage",omschrijving:"Montage",budget:24,voorganger:"p2"}];
    D.verlof = ${JSON.stringify(verlof)};
    D.planning = [];
    ["2026-11-16","2026-11-17","2026-11-18","2026-11-19","2026-11-20"].forEach(function(x,i){ D.planning.push({id:"o"+i,taak:"o",resource:"lisa",datum:x,uren:8}); });
    ["2026-11-23","2026-11-24","2026-11-25","2026-11-26","2026-11-27"].forEach(function(x,i){ D.planning.push({id:"p"+i,taak:"p2",resource:"ruud",datum:x,uren:8}); });
    ["2026-11-30","2026-12-01","2026-12-02"].forEach(function(x,i){ D.planning.push({id:"m"+i,taak:"m",resource:"jeroen",datum:x,uren:8}); });
    var prev = previewKeten("o", [{id:"o4", datum:"2026-11-24", resource:"lisa"}]);
    JSON.stringify({ prev: prev, nietOpgeslagen: D.planning.find(function(x){return x.id==="o4";}).datum === "2026-11-20" });
  `, ctx);
}

// Geval 1: vrije capaciteit. Productie +2 werkdagen, Montage +2, projecteinddatum 2 dec -> 4 dec.
const a = JSON.parse(scenario([]));
const oa = Object.fromEntries(a.prev.opvolgers.map(o => [o.taak.id, o.totaal]));
assert.strictEqual(oa.p2, 2, "Productie moet 2 werkdagen schuiven");
assert.strictEqual(oa.m, 2, "Montage moet 2 werkdagen schuiven");
assert.strictEqual(a.prev.conflicten.length, 0, "geen conflicten bij vrije capaciteit");
assert.strictEqual(a.prev.projecten[0].na, "2026-12-04", "nieuwe projecteinddatum");
assert.strictEqual(a.nietOpgeslagen, true, "preview mag niets opslaan");

// Geval 2: Ruud heeft verlof op 25 nov. Het blok blijft staan en er moet een conflict zijn.
const b = JSON.parse(scenario([{ id: "vx", resource: "ruud", datum: "2026-11-25", uren: 8 }]));
assert.ok(b.prev.conflicten.some(c => /25 nov onvoldoende capaciteit/.test(c.tekst)), "capaciteitsconflict Ruud 25 nov");
assert.ok(b.prev.conflicten.some(c => /Productie kan niet starten na 24 nov/.test(c.tekst)), "opvolger start vóór einde voorganger");
assert.strictEqual(b.nietOpgeslagen, true);

console.log("keten-acceptatie: alle asserts geslaagd");
