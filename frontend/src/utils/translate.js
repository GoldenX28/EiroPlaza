const translations = {
  lv: {
    searchCountryPlaceholder: 'Piem., Horvātija',
    mapOverviewTitle: 'Atrašanās vieta',
    mapPointLabel: 'Kartes punkts',
    mapWhyLabel: 'Kāpēc šis punkts',
    mapExplainLabel: 'Paskaidrojums',
    mapExplainText: 'Karte rāda galvaspilsētas punktu, ja tas ir pieejams. Ja nav, tiek izmantotas valsts koordinātas.',
    mapCapitalCoords: 'Galvaspilsētas koordinātas',
    mapCountryCoords: 'Valsts koordinātas',
    mapBackToCountry: 'Atpakaļ uz valsti',
    mapViewGeography: 'Apskatīt ģeogrāfiju',
    mapLoading: 'Notiek kartes ielāde...',
    countryLoading: 'Notiek ielāde...',
    countriesLoading: 'Notiek valstu ielāde...',
    resultsShown: 'Rādītas',
    of: 'no',
    countries: 'valstīm',
    clearFilters: 'Notīrīt filtrus',
    searchCountry: 'Meklēt valsti',
    timezone: 'Laika josla',
    all: 'Visi',
    continent: 'Kontinents',
    sortBy: 'Kārtot pēc',
    order: 'Secība',
    name: 'Nosaukuma',
    capital: 'Galvaspilsētas',
    population: 'Iedzīvotāju skaita',
    ascending: 'A-Z / augošā',
    descending: 'Z-A / dilstošā'
  }
};

export function t(key, locale = 'lv') {
  return translations[locale]?.[key] ?? key;
}

export default t;
