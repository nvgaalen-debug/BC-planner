// Controle van de BC-API-spec: nog te plannen = remainingHours - gepland; zonder prognose budget - gerealiseerd.
// Voorbeelden uit BC_API_datastructuur_projectplanning (P2026-031). Draaien vanuit de projectmap.
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16", proj:null}, toast(){}, render(){}, save(){}, pushState(){} };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
const r = JSON.parse(vm.runInContext(`
  ensureData();
  D.taken = [
    { id:"a", project:"p1", groep:"Montage", omschrijving:"Montage", budget:24, gerealiseerd:16, remaining:16 },
    { id:"b", project:"p1", groep:"Productie", omschrijving:"Fabriceren", budget:80, gerealiseerd:72, remaining:8 },
    { id:"c", project:"p1", groep:"Montage", omschrijving:"Oplevering", budget:8, gerealiseerd:0 }
  ];
  D.planning = [
    { id:"x1", taak:"a", resource:"r1", datum:"2026-11-20", uren:8 },
    { id:"x2", taak:"b", resource:"r2", datum:"2026-11-18", uren:8 }
  ];
  JSON.stringify({
    restA: restUren(D.taken[0]), signA: signaal(D.taken[0]),
    restB: restUren(D.taken[1]), signB: signaal(D.taken[1]),
    restC: restUren(D.taken[2]), signC: signaal(D.taken[2]), bronC: prognoseBron(D.taken[2]), bronA: prognoseBron(D.taken[0]),
  });
`, ctx));
assert.strictEqual(r.restA, 8, "prognose 16 - gepland 8 = 8");
assert.strictEqual(r.signA, "Extra werk plannen");
assert.strictEqual(r.restB, 0, "prognose 8 - gepland 8 = 0; gerealiseerde uren tellen niet dubbel");
assert.strictEqual(r.signB, "Planning dekkend");
assert.strictEqual(r.restC, 8, "fallback: budget 8 - gerealiseerd 0 = 8");
assert.strictEqual(r.bronC, "Fallback: budget min gerealiseerd");
assert.strictEqual(r.bronA, "BC-prognose");
console.log("bc-prognose: alle asserts geslaagd", r);
