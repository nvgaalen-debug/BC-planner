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
