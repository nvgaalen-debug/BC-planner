# BC Resource Planner: stand van zaken

Gebouwd op de azure-app-template. Nu: skeleton met nepdata. Nog niet gekoppeld aan Business Central.

## Wat er nu staat (MVP-skeleton)
- Weekweergave: resources onder elkaar, gegroepeerd per resourcegroep (Development, Consultancy, PM), vijf werkdagen
- Ongepland-paneel: taken met restbudget; slepen naar een cel plant het resterende budget, tot maximaal de dagcapaciteit
- Blokken verslepen naar een andere resource of dag; blok verwijderen met ×
- Kleurcodes: beschikbaar, gepland, volledig bezet, overgepland, niet beschikbaar (verlof)
- Capaciteit per resource per week: uren vrij of overgepland
- Opslag: via de gedeelde status op /api/state (zelfde mechanisme als de template)

## Benchmark: Visual Jobs Scheduler (Netronic)
Wat we uit VJS overnemen: resource-Gantt (de weekweergave), histogram voor bezetting (de kleurcodes en uren vrij), planning op resourcegroep-niveau, drag & drop.
Wat we bewust niet doen in de MVP: projectmatige Gantt, afhankelijkheden tussen taken (VJS voegt die toe omdat BC predecessor/successor voor projecttaken mist).

## Volgende stappen
1. Koppeling met BC: resources, projecten, taken, planningsregels en verlof/capaciteit ophalen via een Functions-endpoint (Entra app-registratie, secret in de app-instellingen)
2. Wegschrijven van planningsregels naar BC; conflicten met de BC-etag afvangen
3. Capaciteitsweergave van 8-12 weken
4. Fase 2: automatisch voorstel plannen (groep, beschikbaarheid, max uren per dag, deadline, skills)

## Datamodel: BC als basis
Principe: BC blijft de bron voor projecten, taken, resources en planning. De planner voegt alleen de visuele dagplanning toe.

| Planner-begrip | BC-object | Opmerking |
|---|---|---|
| Project | Job | Nummer en naam |
| Taak | Job Task | Groep (Ontwerp, Productie, Montage) als eigen veld of via resourcegroep |
| Resource | Resource | Resource Group voor de groep |
| Geplande uren per dag | Job Planning Line | Datum, resource en aantal; schrijven via de API |
| Gerealiseerd | Job Ledger Entry | Alleen lezen, optellen per taak |
| Budget | Budgetregels van de taak | Nog te controleren: aparte regels of Job Planning Lines met budgetsoort |
| Afhankelijkheid (voorganger) | Extensie | BC kent geen predecessor/successor voor projecttaken |
| Deadline per taak | Extensie | Instelling van de planner |
| Verlof / capaciteit | BC-resourcekalender, of extensie | Nog te controleren in de BC-versie |

Open punten voor de koppeling:
- Welke BC-versie en of het SaaS is (bevestigd: SaaS)
- Of budget aparte regels zijn of planningsregels met budgetsoort
- Bron voor verlof en capaciteit
- Hoe de etag wordt gebruikt bij het schrijven van planningsregels

## Afhankelijkheden (versie 1)

Gebouwd in de planner:
- Verplaatsen van een planningblok gaat via een preview: eerst berekenen, dan bevestigen (calculate → preview → confirm → save). Er wordt niets opgeslagen tot "Accepteren".
- Opvolgers schuiven niet blind mee. Per blok wordt de capaciteit op de nieuwe datum gecontroleerd (incl. verlof). Een blok dat niet past blijft staan en krijgt een conflict. Er wordt niet automatisch een andere resource gekozen.
- Ketens: opvolgers van opvolgers worden herberekend. Circulaire afhankelijkheden worden gedetecteerd in de preview.
- Deadline van een taak wordt gecontroleerd; overschrijding staat in de preview.
- Preview toont per taak het aantal werkdagen verschuiving, de projecteinddatum voor en na, en de conflicten.
- Detailvenster toont "🔗 Afhankelijk van" en "⚠ Voorganger loopt uit" als de voorganger later eindigt.

Nog niet gebouwd:
- Lag Workdays in de app (veld `lag` wordt al gelezen, maar het komt nog niet uit BC).
- Dependency type SS, FF, SF.
- Afhankelijkheden aanmaken of wijzigen in de planner (het moet in BC gebeuren).
- Wijzigen van uren (± knop) gaat nu via de preview en toont overbezetting. Het verandert de datums niet, dus opvolgers schuiven niet mee. Er is geen aparte resize-functie.
- Opslaan van de preview als aparte versie.

### BC-datamodel afhankelijkheden (spec)

Tabel in de BC-extensie: Project Task Dependency.
- Entry No., Project No., Project Task No., Predecessor Task No., Dependency Type (FS, SS, FF, SF; in v1 alleen FS), Lag Workdays, Auto Reschedule.
- Voorbeeld: P2026-031, taak 2000 Productie, voorganger 1000 Ontwerp, FS, lag 0, auto reschedule ja.
- Circulaire afhankelijkheden worden in BC geweigerd.
- Via de BC API per afhankelijkheid: projectNo, projectTaskNo, predecessorTaskNo, dependencyType, lagWorkdays, autoReschedule.
- De Azure-app onderhoudt geen eigen afhankelijkheden; BC is de bron.

Acceptatietest (uit spec): P2026-031, Ontwerp 16-20 nov (Lisa, 40u), Productie 23-27 nov (Ruud, 40u, voorganger 1000), Montage 30 nov-2 dec (Jeroen, 24u, voorganger 2000). Verschuif Ontwerp van 20 naar 24 november. Verwacht: Productie wordt herberekend, Montage wordt gecontroleerd op capaciteit van Ruud en Jeroen, conflicten zijn zichtbaar, de nieuwe projecteinddatum staat in de preview, en pas na bevestiging wordt opgeslagen.

## Gantt en bezetting (ronde 3)
- Projectbalk toont datums (taak en periode in de labelregel) en uren gepland/budget in de balk.
- Balk met ⚠ "voorganger loopt uit" krijgt een oranje rand.
- Klik op een projectbalk opent de taakdetail: budget, gepland, nog te plannen, start, verwacht einde, afhankelijkheid, resourceverdeling, en "Naar planning".
- Bezetting toont per resourcegroep en week een tekort als de planning boven de beschikbare capaciteit ligt.
- Nog niet gebouwd: slepen van projectbalken met preview; tekort als "nog in te plannen uren die niet passen".

## Logica-check (ronde 4)
- Regressietest: `node tests/logic/keten-acceptatie.cjs` (acceptatiescenario P2026-031 met en zonder verlof van Ruud).
- Een opvolger die na de preview nog vóór het einde van de voorganger start, krijgt een expliciet conflict.
- Nog niet gebouwd: punt 1 (BC-tabel Project Task Dependency in de AL-extensie) en punt 9 (planning terugschrijven naar BC). Beide hebben een BC-omgeving, API-rechten en besluit over schrijven nodig.

## Basisfuncties (ronde 5)
- Ongedaan maken: knop "Ongedaan maken" in de printbalk en Ctrl+Z. Max 30 stappen, binnen de sessie.
- Verlof zetten en weghalen: rechtermuisknop op een cel, hele dag. Het verlof telt direct mee in de capaciteit.
- Testscript: `node tests/logic/undo-verlof.cjs`.

## BC is leidend (ronde 6)
Uitgangspunt: BC is de bron voor alle stamgegevens. De planner houdt geen eigen kopie bij die afwijkt.

| Gegeven | Bron | In de planner |
|---|---|---|
| Resources en resourcegroepen | BC | alleen lezen |
| Verlof en niet-beschikbaarheid | BC | alleen lezen (lokaal verlof-invoeren is verwijderd) |
| Projecten en projecttaken, budget | BC (Job, Job Task) | alleen lezen |
| Afhankelijkheden | BC (Project Task Dependency) | alleen lezen |
| Planningsregels (dagplanning) | BC (Job Planning Lines) | eerst lokaal, daarna terugschrijven naar BC (nog te bouwen) |
| Gerealiseerde uren | BC (Job Ledger Entry) | alleen lezen |

Nog te bouwen: lezen van BC bij het laden, en terugschrijven van de bevestigde planning. Alleen veilig met een BC-omgeving, API-rechten en een afgesproken moment van synchroniseren.

## AI-uitleg bij conflicten (ronde 7)
- Knop "Uitleg" in de preview-dialoog. Stuurt alleen de conflictteksten naar `/api/uitleg`; resourcenamen worden vervangen door de groep.
- `api/src/functions/uitleg.mjs`: met AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY en AZURE_OPENAI_DEPLOYMENT wordt een model in de EU-regio aangeroepen. Zonder die variabelen, of bij een fout, komt er een vaste uitleg terug. De app werkt dus ook zonder AI.
- Het model beslist niets en rekent niets. Het legt alleen uit en stelt hooguit vervolgstappen voor.
- Vereist voor productie: verwerkersovereenkomst met Microsoft voor de Azure OpenAI-resource, en een DPIA.

## Controle preview en verlof (ronde 8)
- Preview: ja. Vóór opslaan zie je welke opvolgers verschuiven (werkdagen), de projecteinddatum voor en na, het aantal gewijzigde blokken en de conflicten. Annuleren laat alles ongewijzigd.
- Verlof in capaciteit: ja, de capaciteit is 0 op een verlofdag. Nieuw plannen, verslepen en het ±-knopje weigeren op zo'n dag.
- Verlof komt nog niet uit BC. Het verlof in de planner is demodata. De koppeling met BC is nog te bouwen.
- Test: `node tests/logic/verlof-capaciteit.cjs`.

## BC-koppeling: testknop en demodata (ronde 9)
- Instellingen → "Test verbinding" roept `/api/bc/afhankelijkheden` aan en toont het aantal gevonden afhankelijkheden, of de fout.
- Demodata blijft de standaard en werkt zonder BC.
- Nog niet gedaan: BC-nummers als id's gebruiken en projecten, taken, resources en verlof uit BC laden. Dat volgt zodra de sandbox-test van de afhankelijkheden is gelukt, en de endpoints voor die gegevens zijn nagelopen.

## Gegevensbron: demo en BC (ronde 10)
- Instellingen → Gegevensbron: Demodata of Business Central.
- In BC-modus schrijft de planner lokaal niets weg, en laadt hij de demodata niet opnieuw. Zo blijft de demo intact in de opslag.
- BC-modus toont nu nog de demodata, want het laden van BC-data is nog niet gebouwd. Dat volgt.
- Test: `node tests/logic/bron-demo.cjs`.

## Uitleg-provider (ronde 11)
- `/api/uitleg` kiest in volgorde: Anthropic (ANTHROPIC_API_KEY, model via ANTHROPIC_MODEL, standaard claude-haiku-5-5), dan Azure OpenAI, dan vaste uitleg.
- Voor testen: alleen ANTHROPIC_API_KEY instellen in de Static Web App.
- Voor productie met persoonsgegevens-achtige invoer: verwerkersafspraken en DPIA eerst afronden, ook al gaat er alleen geanonimiseerde tekst naar het model.

## Finish-to-start bij plannen (ronde 12)
- Een taak met een voorganger kan pas worden ingepland als de voorganger volledig is ingepland (geen open uren meer) én de opvolger na het laatste blok van de voorganger start.
- Blokken van de voorganger zonder planning, of met nog open uren, blokkeren het plannen van de opvolger.

## Projectfilter (ronde 13)
- Keuzelijst "Project" boven Ongepland. Kies je een project, dan toont Ongepland alleen de taken daarvan.
- In het raster blijven de blokken van dat project gekleurd, de andere worden gedimd.
- De filter wordt niet opgeslagen; hij is per sessie. Test: `node tests/logic/projectfilter.cjs`.
- Nog niet in de Gantt. Dat is een kleine uitbreiding.

## Demodata uitgebreid (ronde 14, DEMO_VERSIE 5)
- 4 resources erbij (Bram, Ilse, Ton, Eva), totaal 9. Bestaande id's zijn ongewijzigd.
- 4e project P2026-040 "Kantoorpand Harderwijk: lichtstraat" met drie taken in een keten (Ontwerp → Productie → Montage, deadline op t10).
- Extra taken: afwerking op P2026-031 en vliesgevelmontage op P2026-034, beide na een voorganger.
- Extra planning: lichtstraat deels gepland (t9 nog open), Lisa op dag 2 dubbel ingepland voor een tekort in Bezetting.
- Extra verlof: Ton op dag 4.
- Let op: bij een nieuwe DEMO_VERSIE wordt de demodata opnieuw gezet (alleen zonder BC-bron).

## BC-API-spec: nog te plannen (ronde 15)
- Effectief restant per taak: `remaining` (BC-prognose) als die er is, anders budget min gerealiseerd (fallback).
- Nog te plannen = MAX(0, effectief restant − gepland). Gerealiseerde uren tellen niet dubbel mee.
- Signaal per taak: "Extra werk plannen", "Planning dekkend" of "Te veel gepland". Zichtbaar in Ongepland en in de details.
- Prognosebron staat in de details: BC-prognose of fallback.
- Tests: `node tests/logic/bc-prognose.cjs` (voorbeelden uit de spreadsheet).
- Nog niet: statusveld per toewijzing (Voorstel/Gepland/Bevestigd/Geannuleerd) en het laden van `remaining` uit BC.

## Status per toewijzing (ronde 16)
- Statussen: Voorstel, Gepland, Bevestigd, Geannuleerd. Regels zonder status gelden als Gepland.
- Nieuwe planning krijgt Gepland. Accepteren van een Voorstel zet de regels op Voorstel.
- In de blokdetails: Bevestigen (zet op Bevestigd) en Planning annuleren (zet op Geannuleerd).
- Geannuleerd telt niet mee voor gepland, restant en capaciteit. Het blok blijft doorgestreept zichtbaar tot je het verwijdert.
- Voorstel-blokken hebben een gestippelde rand. Test: `node tests/logic/status-planning.cjs`.

## Gantt: bovenste rij zichtbaar (ronde 17)
- De vaste kopregel van de Gantt is 34px hoog en bedekte de eerste rij. Rijen beginnen nu onder de kop (`KOPHOOGTE`).
