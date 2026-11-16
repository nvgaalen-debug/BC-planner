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
