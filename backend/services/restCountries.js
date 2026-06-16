const REST_COUNTRIES_ENDPOINT = 'https://api.restcountries.com/countries/v5/region/Europe?limit=100';
import { translateCountryFieldsToLatvian } from './translation.js';
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';

const stripDiacritics = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '');

const getByPath = (source, path) => {
  if (!source || !path) {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(source, path)) {
    return source[path];
  }

  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }

    return undefined;
  }, source);
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const asStringArray = (value, mapper = (item) => item) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(mapper)
    .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
    .filter(Boolean);
};

const readCoordinates = (country, key) => {
  const raw = getByPath(country, key);

  if (Array.isArray(raw) && raw.length >= 2) {
    return raw.slice(0, 2).map((value) => Number(value));
  }

  const latitude = getByPath(raw, 'lat');
  const longitude = getByPath(raw, 'lng');

  if (latitude !== undefined && longitude !== undefined) {
    return [Number(latitude), Number(longitude)];
  }

  return [];
};

const readCapital = (country) => {
  const capitals = getByPath(country, 'capitals');

  if (Array.isArray(capitals) && capitals.length > 0) {
    const firstCapital = capitals[0];
    if (typeof firstCapital === 'string') {
      return firstCapital;
    }

    return firstValue(firstCapital?.name, firstCapital?.common, firstCapital?.official, firstCapital?.label, 'Nav pieejama');
  }

  return firstValue(getByPath(country, 'capital'), 'Nav pieejama');
};

const readLanguages = (country) => {
  const languages = getByPath(country, 'languages');

  if (!Array.isArray(languages)) {
    return [];
  }

  return languages
    .map((language) => {
      if (typeof language === 'string') {
        return language;
      }

      return firstValue(language?.name, language?.english_name, language?.native_name, language?.common, language?.official, language?.language, language?.value, '');
    })
    .filter(Boolean);
};

const readCurrencies = (country) => {
  const currencies = getByPath(country, 'currencies');

  if (!currencies || typeof currencies !== 'object' || Array.isArray(currencies)) {
    return { name: '', code: '' };
  }

  const [currencyCode, currencyData] = Object.entries(currencies)[0] || [];
  return {
    name: firstValue(currencyData?.name, currencyData?.label, ''),
    code: firstValue(currencyCode, currencyData?.code, '')
  };
};

const readFlag = (country) => {
  const svg = firstValue(getByPath(country, 'flag.url_svg'), getByPath(country, 'flag.svg'), getByPath(country, 'flags.svg'), '');
  const png = firstValue(getByPath(country, 'flag.url_png'), getByPath(country, 'flag.png'), getByPath(country, 'flags.png'), '');
  const alt = firstValue(getByPath(country, 'flag.description'), getByPath(country, 'flag.alt'), getByPath(country, 'flags.alt'), '');

  return { svg, png, alt };
};

const readTranslations = async (country) => {
  const existingTranslations = getByPath(country, 'names.translations') || getByPath(country, 'translations') || {};
  const latvianTranslations = await translateCountryFieldsToLatvian(country);

  return {
    ...existingTranslations,
    lav: {
      ...existingTranslations.lav,
      common: getByPath(existingTranslations, 'lav.common') || getByPath(existingTranslations, 'lv.common') || latvianTranslations.common,
      official: getByPath(existingTranslations, 'lav.official') || getByPath(existingTranslations, 'lv.official') || latvianTranslations.official,
      alt: getByPath(existingTranslations, 'lav.alt') || getByPath(existingTranslations, 'lv.alt') || latvianTranslations.alt
    }
  };
};

const createFallbackCode = (name) => {
  const normalized = stripDiacritics(name || '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

  return `CUST-${normalized || Date.now().toString(36).toUpperCase()}`;
};

const normalizeCountry = async (country) => {
  const name = firstValue(getByPath(country, 'names.common'), getByPath(country, 'name.common'), getByPath(country, 'name'), 'Nezināma valsts');
  const officialName = firstValue(getByPath(country, 'names.official'), getByPath(country, 'name.official'), getByPath(country, 'officialName'), '');
  const flag = readFlag(country);
  const coordinates = readCoordinates(country, 'coordinates');
  const capitalCoordinates = readCoordinates(country, 'capitals.0.coordinates');
  const translations = await readTranslations(country);
  const currencies = readCurrencies(country);
  const sovereign = getByPath(country, 'classification.sovereign');
  const unMember = getByPath(country, 'classification.un_member');

  return {
    code: firstValue(getByPath(country, 'codes.alpha_3'), getByPath(country, 'codes.alpha_2'), createFallbackCode(name)),
    cca2: firstValue(getByPath(country, 'codes.alpha_2'), ''),
    ccn3: firstValue(getByPath(country, 'codes.ccn3'), ''),
    cioc: firstValue(getByPath(country, 'codes.cioc'), ''),
    name,
    officialName,
    capital: readCapital(country),
    population: Number(firstValue(getByPath(country, 'population'), 0)),
    languages: readLanguages(country),
    timezone: asStringArray(firstValue(getByPath(country, 'timezones'), []))[0] || 'Nav pieejama',
    timezones: asStringArray(getByPath(country, 'timezones')),
    primaryTimezone: (() => {
      try {
        const latlng = capitalCoordinates.length >= 2
          ? capitalCoordinates
          : (coordinates.length >= 2 ? coordinates : null);

        if (!latlng) return '';
        return tzlookup(latlng[0], latlng[1]);
      } catch (err) {
        return '';
      }
    })(),
    primaryUtcOffset: (() => {
      try {
        const latlng = capitalCoordinates.length >= 2
          ? capitalCoordinates
          : (coordinates.length >= 2 ? coordinates : null);

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
    continent: asStringArray(getByPath(country, 'continents'))[0] || firstValue(getByPath(country, 'region'), ''),
    region: firstValue(getByPath(country, 'region'), ''),
    subregion: firstValue(getByPath(country, 'subregion'), ''),
    flag: firstValue(flag.svg, flag.png, ''),
    flags: {
      png: flag.png,
      svg: flag.svg,
      alt: flag.alt
    },
    maps: {
      googleMaps: firstValue(getByPath(country, 'links.google_maps'), getByPath(country, 'maps.googleMaps'), ''),
      openStreetMaps: firstValue(getByPath(country, 'links.open_street_maps'), getByPath(country, 'maps.openStreetMaps'), '')
    },
    capitalInfo: {
      latlng: capitalCoordinates
    },
    latlng: coordinates,
    area: Number(firstValue(getByPath(country, 'area.kilometers'), getByPath(country, 'area'), 0)),
    borders: asStringArray(getByPath(country, 'borders')),
    tld: asStringArray(firstValue(getByPath(country, 'tlds'), getByPath(country, 'tld'), [])),
    altSpellings: asStringArray(getByPath(country, 'names.alternates')),
    independent: typeof sovereign === 'boolean' ? sovereign : null,
    landlocked: typeof getByPath(country, 'landlocked') === 'boolean' ? getByPath(country, 'landlocked') : null,
    status: firstValue(getByPath(country, 'classification.iso_status'), getByPath(country, 'status'), ''),
    unMember: typeof unMember === 'boolean' ? unMember : null,
    startOfWeek: firstValue(getByPath(country, 'date.start_of_week'), getByPath(country, 'startOfWeek'), ''),
    fifa: firstValue(getByPath(country, 'codes.fifa'), getByPath(country, 'fifa'), ''),
    car: {
      signs: asStringArray(firstValue(getByPath(country, 'cars.signs'), getByPath(country, 'car.signs'), [])),
      side: firstValue(getByPath(country, 'cars.driving_side'), getByPath(country, 'car.side'), '')
    },
    coatOfArms: {
      png: firstValue(getByPath(country, 'coatOfArms.png'), getByPath(country, 'coat_of_arms.png'), ''),
      svg: firstValue(getByPath(country, 'coatOfArms.svg'), getByPath(country, 'coat_of_arms.svg'), '')
    },
    gini: firstValue(getByPath(country, 'economy.gini_coefficient'), getByPath(country, 'gini'), {}),
    demonyms: firstValue(getByPath(country, 'demonyms'), {}),
    translations,
    postalCode: {
      format: firstValue(getByPath(country, 'postal_code.format'), getByPath(country, 'postalCode.format'), ''),
      regex: firstValue(getByPath(country, 'postal_code.regex'), getByPath(country, 'postalCode.regex'), '')
    },
    currency: currencyData ? {
      name: firstValue(currencyData.name, currencyData.label, ''),
      code: firstValue(currencyCode, '')
    } : {
      name: currencies.name,
      code: currencies.code
    },
    rawData: country
  };
};

const fetchRestCountries = async () => {
  const apiKey = process.env.REST_COUNTRIES_API_KEY;

  if (!apiKey) {
    throw new Error('REST_COUNTRIES_API_KEY is not set. Add a REST Countries v5 API key to sync countries.');
  }

  const response = await fetch(REST_COUNTRIES_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`REST Countries API request failed with status ${response.status}`);
  }

  const data = await response.json();

  const countries = data?.data?.objects;

  if (!Array.isArray(countries)) {
    throw new Error('REST Countries API returned an unexpected payload');
  }

  return Promise.all(countries.map(normalizeCountry));
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