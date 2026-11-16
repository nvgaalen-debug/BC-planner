# Tests

Drie lagen, elk met een eigen doel. `npm test` draait ze alle drie, in deze volgorde.

| Laag | Commando | Draait tegen | Doel |
|---|---|---|---|
| 1. Motor | `npm run motor` | niets (pure functies) | Snelle logicatests, node:test, geen server nodig. |
| 2. API | `npm run api` | de echte `api/src/functions/*.mjs`-handlers, met Table/Blob Storage nagebootst in het geheugen | Unittest van elke serverfunctie: wachtwoordcontrole, versiebeveiliging, timeout/herhaling — zonder Azure-account en zonder een server te starten. |
| 3. Browser | `npm run browser` | een lokale testserver (`tests/server/server.mjs`) die de echte frontend-bestanden serveert én de echte API-functies uitvoert | Rooktest door een echte browser (Playwright): klikken, formulieren invullen, controleren wat er op het scherm staat. |

## Hoe de nabootsing werkt

`tests/server/fakes/` bevat drie kleine bestanden die doen alsof ze `@azure/functions`,
`@azure/data-tables` en `@azure/storage-blob` zijn, maar alles in het geheugen van het testproces
bewaren. `tests/server/loader.mjs` is een Node module-loader die die drie pakketnamen naar de
nep-versies omleidt zodra je ze importeert — de bestanden in `api/src/functions/` weten niet dat ze
getest worden en hoeven niet aangepast te worden.

- **Laag 2 (API-tests)** gebruikt deze loader rechtstreeks (`node --experimental-loader=...`) en
  importeert een functiebestand, waarna die zich registreert in de nep-`@azure/functions` (de
  `ROUTES`-lijst). De test roept `route.handler(fakeReq)` direct aan — geen HTTP, geen server.
- **Laag 3 (browsertests)** start `tests/server/server.mjs`: een gewone Node-HTTP-server die
  statische bestanden serveert (dezelfde `index.html`, `js/`, `css/` als in productie) én, voor elk
  `/api/...`-verzoek, de bijpassende functiehandler aanroept — met dezelfde in-het-geheugen-nabootsing
  als laag 2. Playwright praat dus met een echte browser die een echte pagina laadt, die weer echte
  `fetch()`-aanroepen doet naar wat zich voordoet als de Azure-API.

Geen van de twee lagen raakt het echte internet of een echt Azure-account. Externe aanroepen (zoals in
`api/src/functions/extern.mjs`) worden door de testserver geweigerd, tenzij je er zelf een nabootsing
voor toevoegt in `tests/server/server.mjs` (zie de PDOK-nabootsing in Wasroute als voorbeeld, als je
die kant op gaat).

## Lokaal draaien

```bash
cd tests
npm install
npx playwright install chromium   # eenmalig; of zet PW_CHROMIUM op een bestaand chromium-pad
npm test                          # motor + api + browser
```

Los een laag draaien: `npm run motor`, `npm run api`, of `npm run browser`. Voor de browserlaag kun je
ook `npm run server` draaien en zelf naar `http://localhost:4280` surfen, bijvoorbeeld om iets met de
hand te proberen voordat je er een test voor schrijft.

## Eigen tests toevoegen

- **Motor**: nieuwe pure-logicafuncties (bijv. een berekening, een filter) → `tests/engine/*.test.mjs`.
- **API**: een nieuwe functie in `api/src/functions/` → een bijpassend bestand in `tests/api/`, naar
  het voorbeeld van `state.test.mjs` (importeer de functie, zoek hem op in `ROUTES`, roep
  `route.handler(fakeReq)` aan).
- **Browser**: een nieuw scherm of knop → een `*.spec.mjs` in `tests/e2e/`, met `page.goto("/")` en
  Playwright's `page.click()`/`page.fill()`/`expect()`.
