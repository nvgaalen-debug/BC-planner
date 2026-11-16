// Twee onafhankelijke, optionele wachtwoorden — geen gebruikersaccounts, geen rollen.
// APP_PASSWORD      beveiligt de API echt (wordt op de server gecontroleerd): zonder (of met
//                   het verkeerde) wachtwoord krijgt een verzoek altijd 401, wat er ook gebeurt.
// BEHEER_WACHTWOORD verbergt in de FRONTEND alleen het Beheer-menu voor wie het niet kent.
//                   Dit is GEEN extra serverbeveiliging: iedereen met het gewone APP_PASSWORD kan
//                   via de normale routes nog steeds alles lezen en schrijven. Gebruik dit alleen
//                   om instellingen uit het zicht te houden van collega's die ze niet nodig hebben,
//                   niet om gevoelige data af te schermen. Voor echte rollen/rechten per gebruiker
//                   is een ander model nodig (bijv. Azure Static Web Apps-rollen met inloggen).

export const json = (data, status = 200) => ({
  status,
  headers: { "cache-control": "no-store" },
  jsonBody: data,
});

export const appOk = (req) => {
  const pw = process.env.APP_PASSWORD;
  return !pw || req.headers.get("x-app-password") === pw;
};

export const beheerActief = () => !!process.env.BEHEER_WACHTWOORD;

export const beheerOk = (req) => {
  const pw = process.env.BEHEER_WACHTWOORD;
  return !pw || req.headers.get("x-beheer-password") === pw;
};
