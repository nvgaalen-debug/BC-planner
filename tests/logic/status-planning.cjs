// Controle van de status per toewijzing: Geannuleerd telt niet mee, Voorstel en Gepland wel.
// Draaien vanuit de projectmap: node tests/logic/status-planning.cjs
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16", proj:null}, toast(){}, render(){}, save(){}, pushState(){} };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
const r = JSON.parse(vm.runInContext(`
  ensureData();
  D.taken = [{ id:"a", project:"p1", groep:"Montage", omschrijving:"Montage", budget:24, gerealiseerd:0 }];
  D.planning = [
    { id:"s1", taak:"a", resource:"r1", datum:"2026-11-20", uren:8, status:"Gepland" },
    { id:"s2", taak:"a", resource:"r1", datum:"2026-11-21", uren:8, status:"Voorstel" },
    { id:"s3", taak:"a", resource:"r1", datum:"2026-11-22", uren:8, status:"Geannuleerd" },
    { id:"s4", taak:"a", resource:"r1", datum:"2026-11-23", uren:4 }
  ];
  JSON.stringify({ gepl: geplandVan(D.taken[0]), rest: restUren(D.taken[0]), statusOud: statusVan(D.planning[3]), statusGeannuleerd: statusVan(D.planning[2]) });
`, ctx));
assert.strictEqual(r.gepl, 20, "Gepland 8 + Voorstel 8 + oud zonder status 4 = 20; geannuleerd telt niet mee");
assert.strictEqual(r.rest, 4, "budget 24 - 20 = 4");
assert.strictEqual(r.statusOud, "Gepland", "regel zonder status geldt als Gepland");
assert.strictEqual(r.statusGeannuleerd, "Geannuleerd");
console.log("status-planning: alle asserts geslaagd", r);
