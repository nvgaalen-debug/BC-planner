const fs = require("fs"), vm = require("vm");
const ctx = { console, document: { createElement(){return {classList:{add(){},remove(){}}, style:{}}}, body:{appendChild(){}}, addEventListener(){}, querySelectorAll(){return []}, getElementById(){return {onclick:null,hidden:false,innerHTML:""}}, querySelector(){return null} },
  localStorage:{getItem(){return null},setItem(){},removeItem(){}}, sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},
  location:{protocol:"file:"}, BroadcastChannel: undefined, fetch: async()=>({}), setTimeout, clearTimeout, Date, S:{tab:"overzicht", week:"2026-11-16"}, toast(){}, render(){}, pushState(){}};
vm.createContext(ctx);
for (const f of ["01-kern.js","02-auth.js","04-sync.js","06-planner.js"]) vm.runInContext(fs.readFileSync("js/"+f,"utf8"), ctx, {filename:f});
console.log(vm.runInContext(`
  ensureData(); var out = {};
  var n0 = D.verlof.length;
  D.verlof.push({id:"vt", resource:"r1", datum:"2026-11-18", uren:8}); save();        // verlof toevoegen
  out.na_toevoegen = D.verlof.length - n0;
  D.verlof = D.verlof.filter(function(x){return x.id!=="vt";}); save();                // verlof weghalen
  out.na_weghalen = D.verlof.length - n0;
  D.planning = D.planning.filter(function(x){return x.id!=="l1";}); save();            // wijziging om te undo'en
  out.l1_weg = D.planning.some(function(x){return x.id==="l1";}) === false;
  undo();
  out.l1_terug = D.planning.some(function(x){return x.id==="l1";});
  undo(); undo(); undo(); undo();
  out.verlof_na_undo = D.verlof.length;
  JSON.stringify(out);
`, ctx));
