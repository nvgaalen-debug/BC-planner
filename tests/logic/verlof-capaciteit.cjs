// Controle: geen planning op een verlofdag, en verlof verlaagt de capaciteit.
// Draaien vanuit de projectmap: node tests/logic/verlof-capaciteit.cjs
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const toasts = [];
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, BroadcastChannel: undefined, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16"}, toast(m){ toasts.push(m); }, render(){}, save(){}, pushState(){} };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
const out = JSON.parse(vm.runInContext(`
  ensureData();
  // demo: r3 heeft verlof op d(2) = 18 nov; t6 hoort bij groep Montage
  var voor = D.planning.length;
  planTaak("t6", "r3", "2026-11-18");          // afwezig -> geweigerd
  var geenPlanning = D.planning.length === voor;
  var capVerlof = capFor("r3", "2026-11-18");
  var capNormaal = capFor("r3", "2026-11-19");
  JSON.stringify({ geenPlanning: geenPlanning, capVerlof: capVerlof, capNormaal: capNormaal });
`, ctx));
assert.strictEqual(out.geenPlanning, true, "geen planning op een verlofdag");
assert.strictEqual(out.capVerlof, 0, "verlof maakt de capaciteit 0");
assert.ok(out.capNormaal > 0, "normale dag heeft capaciteit");
console.log("verlof-capaciteit: alle asserts geslaagd", out);
