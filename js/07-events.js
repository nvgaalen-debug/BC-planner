/* ---------- weergave + centrale klik/submit-afhandeling + opstarten ---------- */
let S = { tab: "overzicht", week: null };

function render() {
  const top = $("#top-in");
  if (top) top.innerHTML = `
    <div class="brand">${esc(D.settings?.titel || "Mijn app")}</div>
    <nav class="tabs" id="nav">${renderNav()}</nav>`;
  const v = $("#view");
  if (v && SYNC_READY) v.innerHTML = viewTab();
}

document.addEventListener("click", async (e) => {
  const navg = e.target.closest('[data-act="navg"]');
  if (navg) { const g = $(`.navg[data-g="${navg.dataset.g}"]`); g.classList.toggle("open"); return; }
  const to = e.target.closest("[data-to]");
  if (to) {
    if (to.dataset.to.startsWith("tab:instellingen") && beheerGated()) { closeMenus(); askBeheerPw(() => navTo(to.dataset.to)); return; }
    navTo(to.dataset.to); return;
  }
  if (!e.target.closest(".navg")) closeMenus();

  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const a = btn.dataset.act;
  if (a === "beheerslot") { askBeheerPw(() => render()); return; }
  if (a === "srvretry") { initSync(); return; }
});

document.addEventListener("submit", (e) => {
  const f = e.target.closest("[data-form]");
  if (!f) return;
  e.preventDefault();
  const kind = f.dataset.form;
  if (kind === "settings") {
    D.settings = D.settings || {};
    D.settings.titel = f.titel.value.trim() || "Mijn app";
    save();
    toast("Instellingen opgeslagen.");
  }
});

async function init() {
  render();
  await initSync();
  beheerStatus().then(() => render());
}
document.addEventListener("DOMContentLoaded", init);

/* Labels van de Gantt blijven vast staan bij horizontaal scrollen. */
document.addEventListener("scroll", (ev) => {
  const w = ev.target;
  if (!w || !w.classList || !w.classList.contains("grid-wrap")) return;
  w.querySelectorAll(".g-lbl").forEach((el) => { el.style.transform = "translateX(" + w.scrollLeft + "px)"; });
}, true);
