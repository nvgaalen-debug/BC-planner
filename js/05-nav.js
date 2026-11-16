/* ---------- navigatie: tabs plus "meer"-dropdowns, met Beheer-afscherming ---------- */
const MENU_ITEMS = {
  "tab:overzicht": ["Planning", ""],
  "tab:instellingen": ["Instellingen", ""],
  "act:beheerlock": ["Beheer vergrendelen", "Verberg het Beheer-menu weer tot het wachtwoord opnieuw is ingevuld"],
  "act:logout": ["Uitloggen", "Vergeet het wachtwoord op dit tabblad"],
};
function menuCfg() {
  return {
    top: ["tab:overzicht", "g:beheer"],
    groups: { beheer: { l: "Beheer", items: ["tab:instellingen", "act:beheerlock", "act:logout"] } },
  };
}
const mLabel = (id) => MENU_ITEMS[id][0];

/* Items die, als Beheer vergrendeld is, uit de navigatie verdwijnen (niet alleen onklikbaar: weg) */
const navHidden = (id) => {
  if (id === "act:beheerlock") return BEHEER_ACTIEF !== true || beheerGated();
  return (id.startsWith("tab:instellingen") || id === "act:logout") && beheerGated();
};
function buildNav() {
  const m = menuCfg();
  return m.top.map((x) => {
    if (!x.startsWith("g:")) return navHidden(x) ? null : { k: x, l: mLabel(x), to: x, d: MENU_ITEMS[x][1] };
    const g = m.groups[x.slice(2)];
    const items = g.items.filter((id) => !navHidden(id));
    return { k: x, l: g.l, items: items.map((id) => [id, mLabel(id), MENU_ITEMS[id][1]]) };
  }).filter(Boolean).filter((g) => !g.items || g.items.length);
}
function navTo(t) {
  if (t.startsWith("tab:")) { S.tab = t.slice(4); closeMenus(); render(); return; }
  closeMenus();
  if (t === "act:beheerlock") beheerVergrendel();
  else if (t === "act:logout") logoutPw();
}
function closeMenus() { $$(".navg.open").forEach((n) => n.classList.remove("open")); }

function renderNav() {
  const nodes = buildNav();
  return nodes.map((n) => {
    if (n.items) {
      const openCls = $(`.navg[data-g="${n.k}"]`)?.classList.contains("open") ? " open" : "";
      return `<div class="navg${openCls}" data-g="${esc(n.k)}">
        <button class="tab" data-act="navg" data-g="${esc(n.k)}" aria-pressed="${S.tab === "instellingen"}">${esc(n.l)}${I.chev}</button>
        <div class="navmenu">${n.items.map(([id, l, d]) => `<button data-to="${esc(id)}">${id === "tab:instellingen" ? I.lock + " " : ""}<b>${esc(l)}</b>${d ? `<small>${esc(d)}</small>` : ""}</button>`).join("")}</div>
      </div>`;
    }
    return `<button class="tab" data-to="${esc(n.to)}" aria-pressed="${S.tab === n.to.slice(4)}">${esc(n.l)}</button>`;
  }).join("") + (beheerGated() ? `<button class="iconbtn" data-act="beheerslot" title="Beheer ontgrendelen" style="margin-left:4px">${I.unlock}</button>` : "");
}
