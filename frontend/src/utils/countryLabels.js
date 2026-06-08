const getTranslation = (country, key) => country?.translations?.lav?.[key] || country?.translations?.lv?.[key] || '';

const regionDisplayNames = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['lv'], { type: 'region' })
  : null;

const getRegionCode = (country) => {
  const code = country?.cca2 || country?.code || '';
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
};

const getLocalizedRegionName = (country) => {
  const regionCode = getRegionCode(country);

  if (!regionCode || !regionDisplayNames) {
    return '';
  }

  try {
    return regionDisplayNames.of(regionCode) || '';
  } catch {
    return '';
  }
};

const translateFlagDescription = (description, countryName) => {
  if (!description) {
    return '';
  }

  const normalizedName = String(countryName || '').trim();
  let translated = String(description).trim();

  translated = translated.replace(/^The national flag of\s+/i, `${normalizedName} valsts karogs: `);
  translated = translated.replace(/^The flag of\s+/i, `${normalizedName} karogs: `);
  translated = translated.replace(/^Flag of\s+/i, `${normalizedName} karogs: `);
  translated = translated.replace(/^The flag\s+of\s+/i, `${normalizedName} karogs: `);

  if (translated === String(description).trim()) {
    translated = `${normalizedName || 'Šī valsts'} karogs`;
  }

  return translated;
};

export const getCountryDisplayName = (country) => {
  return getTranslation(country, 'common')
    || getLocalizedRegionName(country)
    || country?.officialName
    || country?.name
    || 'Nezināma valsts';
};

export const getCountryOfficialDisplayName = (country) => {
  return getTranslation(country, 'official')
    || country?.officialName
    || country?.name
    || getLocalizedRegionName(country)
    || '';
};

export const getCountryNameForFlag = (country) => {
  return `${getCountryDisplayName(country)} karogs`;
};

export const getCountryFlagDescription = (country) => {
  const translatedFlagText = country?.translations?.lav?.alt || country?.translations?.lv?.alt;

  if (translatedFlagText) {
    return translatedFlagText;
  }

  const localizedCountryName = getCountryDisplayName(country);
  const sourceDescription = country?.flags?.alt || '';

  return translateFlagDescription(sourceDescription, localizedCountryName) || getCountryNameForFlag(country);
};

export default {
  getCountryDisplayName,
  getCountryOfficialDisplayName,
  getCountryNameForFlag,
  getCountryFlagDescription
};
