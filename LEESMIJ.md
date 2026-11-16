# App-template (Azure Static Web Apps)

Starter voor een nieuwe app met hetzelfde fundament als Wasroute Planner: een vanilla-JS frontend,
een Azure Functions API, en Azure Table/Blob Storage als enige database — zonder apart
database-abonnement, zonder gebruikersaccounts, met één (of twee) gedeelde wachtwoorden.

Dit is een skelet, geen kant-en-klare app: de voorbeeldlogica (een simpele to-do-lijst) staat er om
te laten zien hoe de delen samenwerken. Vervang `js/06-app.js` en de inhoud van `D` door je eigen
schermen en gegevens; de rest (wachtwoorden, synchronisatie met de server, navigatie, teststructuur)
kan grotendeels blijven staan.

## Hoe de stukken samenwerken

```
index.html              laadt de JS-lagen in volgorde
js/01-kern.js           $, esc, toast, iconen — door alles gebruikt
js/02-auth.js           APP_PASSWORD: wachtwoordvenster, delen tussen tabbladen, api()-helper
js/03-beheer.js         optioneel BEHEER_WACHTWOORD: verbergt alleen het Beheer-menu
js/04-sync.js           D (alle app-data) synchroniseren met /api/state, met conflictafhandeling
js/05-nav.js            tabs + dropdown-menu's, met afscherming van Beheer-only items
js/06-app.js            JOUW APP: schermen, knoppen, formulieren — vervang dit
js/07-events.js         render(), centrale klik/submit-afhandeling, opstarten

api/src/lib/store.mjs   Blob Storage-adapter (get/setJSON/setRaw/list) — algemeen, niet aanpassen
api/src/lib/auth.mjs    de twee wachtwoord-helpers — algemeen, niet aanpassen
api/src/functions/
  state.mjs             GET/PUT /api/state — de ENE gedeelde JSON-blob (D), met versiebeveiliging
  beheerpw.mjs          GET /api/beheerpw — checkt het Beheer-wachtwoord
  upload.mjs            voorbeeld: bijlage (foto e.d.) opslaan/ophalen — pas aan of verwijder
  extern.mjs            voorbeeld: externe API aanroepen met timeout + 1 herhaling — pas aan of verwijder

tests/                  zie tests/LEESMIJ.md
```

**Het centrale idee**: er is geen database met tabellen per onderdeel. Alle app-data staat in één
JSON-object (`D` in de frontend) dat als geheel naar `/api/state` gaat. Table Storage bewaart dat JSON
in stukken van 30.000 tekens (de limiet van een Table-rij), met een versienummer erbij. Bij het
opslaan stuurt de frontend de laatst geziene versie mee; de server wijst het af (409) als iemand
anders intussen al heeft opgeslagen, zodat niemand ongemerkt elkaars wijzigingen overschrijft. Voor
bijlagen (foto's, documenten) gebruik je in plaats daarvan Blob Storage direct met een eigen sleutel
per bestand (zie `upload.mjs`) — die horen niet in de ene grote JSON-blob.

Dit past bij een klein team dat door elkaar in dezelfde gegevens werkt (zoals Wasroute: planners die
allemaal naar dezelfde planning kijken). Voor een app met écht gescheiden gegevens per gebruiker of
veel gelijktijdige schrijvers is een andere opzet (meer tabellen, fijnere sleutels) beter.

## Een nieuwe app opzetten

1. **Hernoemen.** Zoek-en-vervang `"name": "app"` / `"app-api"` / `"app-tests"` in de drie
   `package.json`-bestanden, de `<title>` in `index.html`, en de containernamen `"bijlagen"` /
   tabelnaam `"appstate"` als je iets herkenbaarders wilt (niet verplicht — ze zijn al generiek).
2. **Azure-resources aanmaken** (eenmalig, via Azure Portal of `az` CLI):
   - Een **Storage Account** (Standaard, LRS is voldoende voor een klein team) — hier komt
     `AZURE_STORAGE_CONNECTION_STRING` uit (Access keys in de portal).
   - Een **Static Web App** (gratis laag is ruim voldoende om te beginnen), gekoppeld aan je
     GitHub-repo. Azure maakt dan automatisch de GitHub Actions-workflow aan (of gebruik de
     voorbeeldworkflow in `.github/workflows/`, met het token dat de portal je geeft als
     `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in de GitHub-repo).
3. **Omgevingsvariabelen instellen** (Static Web App > Instellingen > Omgevingsvariabelen):
   - `AZURE_STORAGE_CONNECTION_STRING` — verplicht.
   - `APP_PASSWORD` — optioneel maar aan te raden: zonder dit is de API voor iedereen met de URL
     open. Zet een wachtwoord zodra er iets van waarde in staat.
   - `BEHEER_WACHTWOORD` — optioneel: alleen zetten als je een apart Beheer-menu wilt verbergen voor
     gebruikers die alleen het gewone wachtwoord kennen (zie de kop hieronder).
4. **`staticwebapp.config.json`** staat nu op "alles achter Microsoft-inloggen" (`allowedRoles:
   authenticated`). Als je geen Microsoft/Azure AD-inloggen wilt en genoeg hebt aan het
   APP_PASSWORD-scherm, verwijder die regel en de `responseOverrides`-regel — dan is de site voor
   iedereen met de link bereikbaar, met het wachtwoordscherm als enige drempel.
5. **Testen en lokaal draaien**: zie `tests/LEESMIJ.md`.
6. **Bouwen**: vervang `js/06-app.js` door je eigen schermen. Voeg nieuwe API-functies toe als losse
   bestanden in `api/src/functions/` (kopieer de vorm van `state.mjs` of `upload.mjs`); Azure Functions
   laadt automatisch elk `.mjs`-bestand in die map.

## De twee wachtwoorden — wat ze wel en niet doen

- **`APP_PASSWORD`** beveiligt de API daadwerkelijk: elke aanroep zonder het juiste wachtwoord in de
  `x-app-password`-header krijgt 401, serverzijdig gecontroleerd. Zonder deze variabele ingesteld is
  er geen beveiliging — handig tijdens het bouwen, niet voor gebruik met echte data.
- **`BEHEER_WACHTWOORD`** is géén extra beveiliging. Het verbergt in de frontend alleen het
  Beheer-menu voor wie het wachtwoord niet heeft ingevuld. Iedereen die het gewone `APP_PASSWORD`
  kent, kan nog steeds via de normale `/api/state`-aanroep alles lezen én schrijven, instellingen
  incluis — er is immers maar één gedeelde `D`. Gebruik dit alleen om instellingen uit het zicht te
  houden van collega's die ze niet nodig hebben, nooit om gevoelige data af te schermen van mensen
  die het gewone wachtwoord al kennen. Voor echte rollen/rechten per gebruiker is een heel ander
  model nodig (ingelogde gebruikers met rollen, een database met rechten per rij) — dat is bewust niet
  wat dit sjabloon doet, omdat het voor een klein, vertrouwd team meer complexiteit toevoegt dan het
  oplevert.

## Wanneer dit sjabloon NIET past

- Veel onafhankelijke gebruikers met eigen, gescheiden data (bijv. een app die klanten van elkaar
  moet afschermen) — dan is per-gebruiker opslag met echte authenticatie nodig, niet één gedeelde
  `D`-blob.
- Heel veel gelijktijdige schrijvers op dezelfde gegevens — de optimistische versiebeveiliging werkt
  prima voor een klein team, maar bij veel conflicten tegelijk voelt "iemand anders sloeg net op,
  jouw wijziging is weg" vervelend. Dan is een fijnmaziger datamodel (losse rijen per item in plaats
  van één grote JSON-blob) beter.
- Een datamodel dat van nature in tabellen/records past (veel losse, doorzoekbare items) — Table
  Storage kan dat ook, maar dan schrijf je per onderdeel een eigen functie zoals `state.mjs` doet voor
  de ene blob, in plaats van alles in één JSON-object te proppen.
