// GET /api/bc/afhankelijkheden  ->  { items: [{ projectNo, projectTaskNo, predecessorTaskNo,
//                                              dependencyType, lagWorkdays, autoReschedule }] }
//
// Leest de afhankelijkheden uit de BC-extensie (API-pagina projectDependencies).
// Business Central is de bron; deze functie cachet niets en slaat niets op.
//
// Omgevingsvariabelen (Azure Static Web App > Omgevingsvariabelen):
//   BC_TENANT_ID       Entra tenant-id
//   BC_CLIENT_ID       app-registratie met toegang tot de BC API
//   BC_CLIENT_SECRET   geheim van die app-registratie
//   BC_ENVIRONMENT     naam van de sandbox of productieomgeving (bijv. "Sandbox")
//   BC_COMPANY_ID      GUID van het bedrijf in BC
// Zonder deze variabelen geeft de functie 503 terug; de planner blijft dan op de lokale data werken.

import { app } from "@azure/functions";
import { json, appOk } from "../lib/auth.mjs";

const SCOPE = "https://api.businesscentral.dynamics.com/.default";

async function token() {
  const r = await fetch(`https://login.microsoftonline.com/${process.env.BC_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.BC_CLIENT_ID,
      client_secret: process.env.BC_CLIENT_SECRET,
      scope: SCOPE,
      grant_type: "client_credentials",
    }),
  });
  if (!r.ok) throw new Error("Token ophalen mislukt (" + r.status + ").");
  return (await r.json()).access_token;
}

function configOk() {
  return ["BC_TENANT_ID", "BC_CLIENT_ID", "BC_CLIENT_SECRET", "BC_ENVIRONMENT", "BC_COMPANY_ID"].every((k) => process.env[k]);
}

async function handler(req) {
  if (req.method !== "GET") return json({ error: "Alleen GET is toegestaan." }, 405);
  if (!appOk(req)) return json({ error: "Wachtwoord klopt niet." }, 401);
  if (!configOk()) return json({ error: "BC-koppeling is niet ingesteld." }, 503);
  try {
    const t = await token();
    const env = encodeURIComponent(process.env.BC_ENVIRONMENT);
    const url = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${env}/api/think2software/planner/v1.0/companies(${process.env.BC_COMPANY_ID})/projectDependencies`;
    const r = await fetch(url, { headers: { authorization: "Bearer " + t, accept: "application/json" } });
    if (!r.ok) return json({ error: "BC gaf fout " + r.status + "." }, 502);
    const d = await r.json();
    const items = (d.value || []).map((x) => ({
      projectNo: x.projectNo,
      projectTaskNo: x.projectTaskNo,
      predecessorTaskNo: x.predecessorTaskNo,
      dependencyType: x.dependencyType,
      lagWorkdays: x.lagWorkdays,
      autoReschedule: x.autoReschedule,
    }));
    return json({ items });
  } catch (e) {
    return json({ error: "BC is niet bereikbaar." }, 502);
  }
}

app.http("bcAfhankelijkheden", { route: "bc/afhankelijkheden", methods: ["GET"], authLevel: "anonymous", handler });
