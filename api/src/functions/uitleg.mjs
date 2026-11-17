// POST /api/uitleg  { conflicten: ["tekst", ...] }  ->  { tekst, bron: "ai" | "regels" }
//
// Uitleg van planningsconflicten. AI is optioneel: zonder de onderstaande omgevingsvariabelen
// wordt een vaste, regelgebaseerde uitleg teruggegeven.
//
// Omgevingsvariabelen (Azure Static Web App > Omgevingsvariabelen). Alles is optioneel.
// Voorrang: Anthropic, dan Azure OpenAI, dan vaste uitleg.
//   ANTHROPIC_API_KEY        sleutel van de Anthropic API (voor testen)
//   ANTHROPIC_MODEL          modelnaam, standaard claude-haiku-5-5
//   AZURE_OPENAI_ENDPOINT    https://<naam>.openai.azure.com
//   AZURE_OPENAI_KEY         sleutel van de Azure OpenAI-resource (EU-regio)
//   AZURE_OPENAI_DEPLOYMENT  naam van de gedeployde chat-model
//
// Privacy: de frontend vervangt resourcenamen door groepscodes voordat iets wordt verstuurd.
// Deze functie stuurt niets anders dan de ontvangen tekst naar het model.

import { app } from "@azure/functions";
import { json, appOk } from "../lib/auth.mjs";

const SYSTEM = "Je bent planningsassistent voor een leverancier van kozijnen en gevelelementen. Leg planningsconflicten kort uit in het Nederlands, in maximaal vijf zinnen. Noem geen personen, alleen groepen en datums. Reken niets zelf uit en beslis niets. Stel hooguit mogelijke vervolgstappen voor.";
const MAX_CONFLICTEN = 20;
const MAX_LEN = 300;

function regels(conflicten) {
  return `Er zijn ${conflicten.length} conflict(en):\n` + conflicten.map((c) => `- ${c}`).join("\n") +
    "\nControleer eerst de capaciteit van de betrokken groep op die dagen. Kijk daarna of de voorganger eerder kan eindigen, of dat de taak over meerdere dagen kan worden gesplitst.";
}

let laatsteFout = null;

async function metAnthropic(conflicten) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { laatsteFout = "ANTHROPIC_API_KEY ontbreekt op de server"; return null; }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: "user", content: "Conflicten:\n" + conflicten.map((c) => `- ${c}`).join("\n") }],
    }),
  });
  if (!r.ok) { laatsteFout = `Anthropic antwoordde met status ${r.status}`; return null; }
  const d = await r.json();
  const tekst = (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return tekst || null;
}

async function metAzure(conflicten) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const dep = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!endpoint || !key || !dep) return null;
  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(dep)}/chat/completions?api-version=2024-06-01`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "api-key": key },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: "Conflicten:\n" + conflicten.map((c) => `- ${c}`).join("\n") },
      ],
      temperature: 0.2,
      max_tokens: 300,
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d?.choices?.[0]?.message?.content?.trim() || null;
}

async function handler(req) {
  if (req.method !== "POST") return json({ error: "Alleen POST is toegestaan." }, 405);
  if (!appOk(req)) return json({ error: "Wachtwoord klopt niet." }, 401);
  let body;
  try { body = await req.json(); } catch (e) { return json({ error: "Ongeldige invoer." }, 400); }
  const conflicten = (Array.isArray(body?.conflicten) ? body.conflicten : [])
    .filter((x) => typeof x === "string")
    .slice(0, MAX_CONFLICTEN)
    .map((x) => x.slice(0, MAX_LEN));
  if (!conflicten.length) return json({ tekst: "Geen conflicten.", bron: "regels" });
  laatsteFout = null;
  try {
    const ai = (await metAnthropic(conflicten)) || (await metAzure(conflicten));
    if (ai) return json({ tekst: ai, bron: "ai" });
  } catch (e) { laatsteFout = "Aanroep van het model mislukt: " + (e.message || "onbekende fout"); }
  return json({ tekst: regels(conflicten), bron: "regels", fout: laatsteFout || "Geen AI-instelling gevonden" });
}

app.http("uitleg", { route: "uitleg", methods: ["POST"], authLevel: "anonymous", handler });
