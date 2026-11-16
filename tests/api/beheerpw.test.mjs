// Unittest voor api/src/functions/beheerpw.mjs: het losse, optionele Beheer-wachtwoord.
// Draai met: npm run api
import { test } from "node:test";
import assert from "node:assert/strict";
import { ROUTES } from "../server/fakes/azure-functions.mjs";

await import("../../api/src/functions/beheerpw.mjs");
const route = ROUTES.find((r) => r.route === "beheerpw");
const req = (pw) => ({ method: "GET", headers: { get: (k) => (k.toLowerCase() === "x-beheer-password" ? pw : null) } });

test("zonder BEHEER_WACHTWOORD ingesteld: actief=false", async () => {
  delete process.env.BEHEER_WACHTWOORD;
  const r = await route.handler(req());
  assert.deepEqual(r.jsonBody, { actief: false, ok: true });
});

test("met BEHEER_WACHTWOORD: geen header geeft 401 actief=true ok=false", async () => {
  process.env.BEHEER_WACHTWOORD = "geheim2";
  const r = await route.handler(req());
  assert.equal(r.status, 401);
  assert.equal(r.jsonBody.actief, true);
  assert.equal(r.jsonBody.ok, false);
});

test("met BEHEER_WACHTWOORD: juist wachtwoord geeft ok=true", async () => {
  process.env.BEHEER_WACHTWOORD = "geheim2";
  const r = await route.handler(req("geheim2"));
  assert.equal(r.status, 200);
  assert.deepEqual(r.jsonBody, { actief: true, ok: true });
});

test("met BEHEER_WACHTWOORD: verkeerd wachtwoord geeft 401", async () => {
  process.env.BEHEER_WACHTWOORD = "geheim2";
  const r = await route.handler(req("foutief"));
  assert.equal(r.status, 401);
  assert.equal(r.jsonBody.ok, false);
});
