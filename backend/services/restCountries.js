const REST_COUNTRIES_ENDPOINT = 'https://restcountries.com/v3.1/region/europe';
import { translateCountryFieldsToLatvian } from './translation.js';
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';

const stripDiacritics = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '');

const createFallbackCode = (name) => {
  const normalized = stripDiacritics(name || '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

  return `CUST-${normalized || Date.now().toString(36).toUpperCase()}`;
};

const normalizeCountry = async (country) => {
  const languages = country.languages ? Object.values(country.languages) : [];
  const currencyEntries = country.currencies ? Object.entries(country.currencies) : [];
  const [currencyCode, currencyData] = currencyEntries[0] || [];
  const name = country?.name?.common || country?.name?.official || 'Nezināma valsts';
  const translations = country.translations || {};
  const latvianTranslations = await translateCountryFieldsToLatvian(country);

  return {
    code: country.cca3 || createFallbackCode(name),
    cca2: country.cca2 || '',
    ccn3: country.ccn3 || '',
    cioc: country.cioc || '',
    name,
    officialName: country?.name?.official || country?.name?.common || '',
    capital: Array.isArray(country.capital) && country.capital.length > 0 ? country.capital[0] : 'Nav pieejama',
    population: Number(country.population || 0),
    languages,
    timezone: Array.isArray(country.timezones) && country.timezones.length > 0 ? country.timezones[0] : 'Nav pieejama',
    timezones: Array.isArray(country.timezones) ? country.timezones : [],
    primaryTimezone: (() => {
      try {
        const latlng = Array.isArray(country?.capitalInfo?.latlng) && country.capitalInfo.latlng.length >= 2
          ? country.capitalInfo.latlng
          : (Array.isArray(country.latlng) && country.latlng.length >= 2 ? country.latlng : null);

        if (!latlng) return '';
        return tzlookup(latlng[0], latlng[1]);
      } catch (err) {
        return '';
      }
    })(),
    primaryUtcOffset: (() => {
      try {
        const latlng = Array.isArray(country?.capitalInfo?.latlng) && country.capitalInfo.latlng.length >= 2
          ? country.capitalInfo.latlng
          : (Array.isArray(country.latlng) && country.latlng.length >= 2 ? country.latlng : null);

        if (!latlng) return '';
        const derived = tzlookup(latlng[0], latlng[1]);
        const standard = DateTime.fromObject({ year: DateTime.now().year, month: 1, day: 1 }).setZone(derived);
        const standardMinutes = standard.offset;
        const sSign = standardMinutes >= 0 ? '+' : '-';
        const sAbs = Math.abs(standardMinutes);
        const sH = String(Math.floor(sAbs / 60)).padStart(2, '0');
        const sM = String(sAbs % 60).padStart(2, '0');
        return `UTC${sSign}${sH}:${sM}`;
      } catch (err) {
        return '';
      }
    })(),
    continent: Array.isArray(country.continents) && country.continents.length > 0 ? country.continents[0] : country.region || '',
    region: country.region || '',
    subregion: country.subregion || '',
    flag: country?.flags?.svg || country?.flags?.png || '',
    flags: {
      png: country?.flags?.png || '',
      svg: country?.flags?.svg || '',
      alt: country?.flags?.alt || ''
    },
    maps: {
      googleMaps: country?.maps?.googleMaps || '',
      openStreetMaps: country?.maps?.openStreetMaps || ''
    },
    capitalInfo: {
      latlng: Array.isArray(country?.capitalInfo?.latlng) ? country.capitalInfo.latlng : []
    },
    latlng: Array.isArray(country.latlng) ? country.latlng : [],
    area: Number(country.area || 0),
    borders: Array.isArray(country.borders) ? country.borders : [],
    tld: Array.isArray(country.tld) ? country.tld : [],
    altSpellings: Array.isArray(country.altSpellings) ? country.altSpellings : [],
    independent: typeof country.independent === 'boolean' ? country.independent : null,
    landlocked: typeof country.landlocked === 'boolean' ? country.landlocked : null,
    status: country.status || '',
    unMember: typeof country.unMember === 'boolean' ? country.unMember : null,
    startOfWeek: country.startOfWeek || '',
    fifa: country.fifa || '',
    car: {
      signs: Array.isArray(country?.car?.signs) ? country.car.signs : [],
      side: country?.car?.side || ''
    },
    coatOfArms: {
      png: country?.coatOfArms?.png || '',
      svg: country?.coatOfArms?.svg || ''
    },
    gini: country.gini || {},
    demonyms: country.demonyms || {},
    translations: {
      ...translations,
      lav: {
        ...translations.lav,
        common: translations?.lav?.common || latvianTranslations.common,
        official: translations?.lav?.official || latvianTranslations.official,
        alt: translations?.lav?.alt || latvianTranslations.alt
      }
    },
    postalCode: country.postalCode || {},
    currency: currencyData ? {
      name: currencyData.name || '',
      code: currencyCode || ''
    } : {
      name: '',
      code: ''
    },
    rawData: country
  };
};

const fetchRestCountries = async () => {
  const response = await fetch(REST_COUNTRIES_ENDPOINT);

  if (!response.ok) {
    throw new Error(`REST Countries API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('REST Countries API returned an unexpected payload');
  }

  return Promise.all(data.map(normalizeCountry));
};

let syncPromise = null;

export const syncCountriesFromRestCountries = async (Country, { force = false } = {}) => {
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = (async () => {
    if (!force) {
      const existingCount = await Country.countDocuments();
      if (existingCount > 0) {
        return Country.find().sort({ name: 1 }).exec();
      }
    }

    const countries = await fetchRestCountries();

    if (countries.length === 0) {
      throw new Error('REST Countries API returned no countries');
    }

    const bulkOperations = countries.map((country) => ({
      updateOne: {
        filter: {
          $or: [
            { code: country.code },
            { name: country.name }
          ]
        },
        update: { $set: country },
        upsert: true
      }
    }));

    await Country.bulkWrite(bulkOperations, { ordered: false });

    return Country.find().sort({ name: 1 }).exec();
  })();

  try {
    return await syncPromise;
  } finally {
    syncPromise = null;
  }
};

export const ensureCountriesAvailable = async (Country) => {
  const count = await Country.countDocuments();
  if (count === 0) {
    await syncCountriesFromRestCountries(Country, { force: true });
  }
};

export const normalizeCountryPayload = (payload = {}) => ({
  code: payload.code || createFallbackCode(payload.name),
  cca2: payload.cca2 || '',
  ccn3: payload.ccn3 || '',
  cioc: payload.cioc || '',
  name: payload.name,
  officialName: payload.officialName || payload.name || '',
  capital: payload.capital || 'Nav pieejama',
  population: Number(payload.population || 0),
  languages: Array.isArray(payload.languages) ? payload.languages : [],
  timezone: payload.timezone || 'Nav pieejama',
  timezones: Array.isArray(payload.timezones) ? payload.timezones : [],
  continent: payload.continent || '',
  region: payload.region || '',
  subregion: payload.subregion || '',
  flag: payload.flag || '',
  flags: payload.flags || { png: '', svg: '', alt: '' },
  maps: payload.maps || { googleMaps: '', openStreetMaps: '' },
  capitalInfo: payload.capitalInfo || { latlng: [] },
  latlng: Array.isArray(payload.latlng) ? payload.latlng : [],
  area: Number(payload.area || 0),
  borders: Array.isArray(payload.borders) ? payload.borders : [],
  tld: Array.isArray(payload.tld) ? payload.tld : [],
  altSpellings: Array.isArray(payload.altSpellings) ? payload.altSpellings : [],
  independent: typeof payload.independent === 'boolean' ? payload.independent : null,
  landlocked: typeof payload.landlocked === 'boolean' ? payload.landlocked : null,
  status: payload.status || '',
  unMember: typeof payload.unMember === 'boolean' ? payload.unMember : null,
  startOfWeek: payload.startOfWeek || '',
  fifa: payload.fifa || '',
  car: payload.car || { signs: [], side: '' },
  coatOfArms: payload.coatOfArms || { png: '', svg: '' },
  gini: payload.gini || {},
  demonyms: payload.demonyms || {},
  translations: payload.translations || {},
  postalCode: payload.postalCode || {},
  currency: payload.currency || { name: '', code: '' },
  rawData: payload.rawData || payload
});