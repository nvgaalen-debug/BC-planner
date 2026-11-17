// Controle: de projectfilter toont alleen de taken van het gekozen project, en dimt de andere blokken.
// Draaien vanuit de projectmap: node tests/logic/projectfilter.cjs
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, BroadcastChannel: undefined, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16", proj:null}, toast(){}, render(){}, save(){}, pushState(){} };
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
const out = JSON.parse(vm.runInContext(`
  ensureData();
  var alle = viewPlanner();
  S.proj = "p1";
  var p1 = viewPlanner();
  var dimP1 = (p1.match(/class="blk dim"/g)||[]).length;
  var pjP1 = (p1.match(/<div class="pj">/g)||[]).length;
  var pjAlle = (alle.match(/<div class="pj">/g)||[]).length;
  var dimAlle = (alle.match(/class="blk dim"/g)||[]).length;
  S.proj = null;
  JSON.stringify({ aantalProjecten: D.projecten.length, pjAlle: pjAlle, pjP1: pjP1, dimAlle: dimAlle, dimP1: dimP1 });
`, ctx));
assert.strictEqual(out.pjAlle, out.aantalProjecten, "alle projecten zichtbaar zonder filter");
assert.strictEqual(out.pjP1, 1, "filter toont één project in Ongepland");
assert.strictEqual(out.dimAlle, 0, "zonder filter geen gedimde blokken");
assert.ok(out.dimP1 > 0, "met filter worden andere blokken gedimd");
console.log("projectfilter: alle asserts geslaagd", out);
