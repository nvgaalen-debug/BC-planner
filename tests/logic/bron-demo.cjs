// Controle: in BC-modus wordt lokaal niets weggeschreven, en de demodata blijft intact.
// Draaien vanuit de projectmap: node tests/logic/bron-demo.cjs
const fs = require("fs"), vm = require("vm"), assert = require("assert");

const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, BroadcastChannel: undefined, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16"}, pushes: 0, toast(){}, render(){}, pushState(){ ctx.pushes++; } };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
const out = JSON.parse(vm.runInContext(`
  ensureData();
  var demoAantal = D.planning.length;
  D.settings.bron = "bc";
  var p0 = pushes;
  D.planning.push({id:"nieuw", taak:"t1", resource:"r1", datum:"2026-11-16", uren:1});
  save();                                   // in BC-modus: geen lokale push
  var pushNaSave = pushes - p0;
  ensureData();                             // mag de demodata niet opnieuw laden
  JSON.stringify({ pushNaSave: pushNaSave, aantalNa: D.planning.length, demoAantal: demoAantal, bron: D.settings.bron });
`, ctx));
assert.strictEqual(out.pushNaSave, 0, "geen push in BC-modus");
assert.strictEqual(out.aantalNa, out.demoAantal + 1, "lokale wijziging blijft in het geheugen, niet in de opslag");
console.log("bron-demo: alle asserts geslaagd", out);
