/* ---------- kernhelpers: gebruikt door alle andere lagen ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

let TOAST_T = null;
function toast(msg, ms = 3200) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.hidden = true; document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(TOAST_T); TOAST_T = setTimeout(() => { el.hidden = true; }, ms);
}

/* Kleine iconenset (inline SVG-paden); voeg zelf toe wat je nodig hebt */
const I = {
  check: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l4 4 8-8"/></svg>',
  more: '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="16" cy="10" r="1.6"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7l5 5 5-5"/></svg>',
  lock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V6a3 3 0 0 1 6 0v3"/></svg>',
  unlock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V6a3 3 0 0 1 5.2-2"/></svg>',
  trash: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10"/></svg>',
};
