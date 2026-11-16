// Unittest tegen de ECHTE Azure Function-handler (api/src/functions/state.mjs), met Table Storage
// in het geheugen in plaats van een echt Azure-account. Draai met: npm run api
import { test } from "node:test";
import assert from "node:assert/strict";
import { ROUTES } from "../server/fakes/azure-functions.mjs";
import { resetTables } from "../server/fakes/data-tables.mjs";

process.env.AZURE_STORAGE_CONNECTION_STRING ||= "UseDevelopmentStorage=true";
process.env.APP_PASSWORD = "geheim";
await import("../../api/src/functions/state.mjs");

const route = ROUTES.find((r) => r.route === "state");
const req = (method, body, pw = "geheim") => ({
  method,
  url: "http://localhost/api/state",
  headers: { get: (k) => (k.toLowerCase() === "x-app-password" ? pw : null) },
  json: async () => body,
});

test.beforeEach(() => resetTables());

test("GET zonder data geeft version 0", async () => {
  const r = await route.handler(req("GET"));
  assert.equal(r.status, 200);
  assert.deepEqual(r.jsonBody, { data: null, version: 0 });
});

test("PUT zonder wachtwoord geeft 401", async () => {
  const r = await route.handler(req("PUT", { data: { a: 1 }, version: 0 }, "fout"));
  assert.equal(r.status, 401);
});

test("PUT en daarna GET geeft de opgeslagen data terug", async () => {
  const put = await route.handler(req("PUT", { data: { a: 1 }, version: 0 }));
  assert.equal(put.jsonBody.version, 1);
  const get = await route.handler(req("GET"));
  assert.deepEqual(get.jsonBody, { data: { a: 1 }, version: 1 });
});

test("PUT met verlopen version geeft 409 en de huidige version", async () => {
  await route.handler(req("PUT", { data: { a: 1 }, version: 0 }));
  const r = await route.handler(req("PUT", { data: { a: 2 }, version: 0 }));
  assert.equal(r.status, 409);
  assert.equal(r.jsonBody.version, 1);
});
