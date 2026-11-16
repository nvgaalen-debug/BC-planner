// Los eindpunt waarmee de frontend checkt of er een BEHEER_WACHTWOORD is ingesteld, en of het
// meegestuurde wachtwoord klopt — zonder dat de frontend het hoofd-wachtwoord (APP_PASSWORD)
// ervoor nodig heeft. Zie api/src/lib/auth.mjs voor wat dit wachtwoord wel en niet beschermt.
//
// GET /api/beheerpw                                -> { actief: false, ok: true }               (geen BEHEER_WACHTWOORD ingesteld)
// GET /api/beheerpw  header x-beheer-password: ...  -> { actief: true, ok: true|false }

import { app } from "@azure/functions";
import { json, beheerActief, beheerOk } from "../lib/auth.mjs";

async function handler(req) {
  if (req.method !== "GET") return json({ error: "Alleen GET is toegestaan." }, 405);
  if (!beheerActief()) return json({ actief: false, ok: true });
  if (!req.headers.get("x-beheer-password")) return json({ actief: true, ok: false }, 401);
  if (!beheerOk(req)) return json({ actief: true, ok: false, error: "Wachtwoord klopt niet." }, 401);
  return json({ actief: true, ok: true });
}

app.http("beheerpw", { route: "beheerpw", methods: ["GET"], authLevel: "anonymous", handler });
