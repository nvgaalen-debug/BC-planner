// Controle van rollen: alleen planners (of beheerders) mogen schrijven. Draaien: node tests/logic/auth-rollen.mjs
import assert from "node:assert/strict";
import { gebruiker, plannerOk } from "../../api/src/lib/auth.mjs";

const maakReq = (principal) => ({
  headers: { get: (k) => (principal && k === "x-ms-client-principal" ? Buffer.from(JSON.stringify(principal)).toString("base64") : null) },
});

const planner = maakReq({ userDetails: "lisa@voorbeeld.nl", userRoles: ["anonymous", "authenticated", "planner"] });
const kijker = maakReq({ userDetails: "gast@voorbeeld.nl", userRoles: ["anonymous", "authenticated"] });
const beheer = maakReq({ userDetails: "beheer@voorbeeld.nl", userRoles: ["authenticated", "beheerder"] });
const zonderLogin = { headers: { get: () => null } };

assert.equal(gebruiker(planner).naam, "lisa@voorbeeld.nl");
assert.equal(plannerOk(planner), true, "planner mag schrijven");
assert.equal(plannerOk(beheer), true, "beheerder mag schrijven");
assert.equal(plannerOk(kijker), false, "kijker mag niet schrijven");
assert.equal(gebruiker(zonderLogin), null);

delete process.env.APP_PASSWORD;
assert.equal(plannerOk(zonderLogin), true, "zonder login en zonder wachtwoord: open (lokaal)");
process.env.APP_PASSWORD = "geheim";
assert.equal(plannerOk(zonderLogin), false, "zonder login: wachtwoord vereist");
console.log("auth-rollen: alle asserts geslaagd");
