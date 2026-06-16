const TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=lv&dt=t&q=';

const cache = new Map();

const normalizeText = (value) => String(value || '').trim();

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

const parseGoogleTranslateResponse = (payload) => {
  if (!Array.isArray(payload)) {
    return '';
  }

  return payload
    .flatMap((segment) => Array.isArray(segment) ? segment : [])
    .map((segment) => Array.isArray(segment) ? segment[0] : '')
    .filter(Boolean)
    .join('')
    .trim();
};

export const translateToLatvian = async (text) => {
  const sourceText = normalizeText(text);

  if (!sourceText) {
    return '';
  }

  if (cache.has(sourceText)) {
    return cache.get(sourceText);
  }

  try {
    const response = await fetch(`${TRANSLATE_ENDPOINT}${encodeURIComponent(sourceText)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translated = parseGoogleTranslateResponse(data) || sourceText;

    cache.set(sourceText, translated);
    return translated;
  } catch {
    cache.set(sourceText, sourceText);
    return sourceText;
  }
};

export const translateCountryFieldsToLatvian = async (country = {}) => {
  const translatedCommon = getByPath(country, 'translations.lav.common') || getByPath(country, 'translations.lv.common') || await translateToLatvian(getByPath(country, 'names.common') || getByPath(country, 'name.common') || getByPath(country, 'names.official') || getByPath(country, 'name.official') || getByPath(country, 'name') || '');
  const translatedOfficial = getByPath(country, 'translations.lav.official') || getByPath(country, 'translations.lv.official') || await translateToLatvian(getByPath(country, 'names.official') || getByPath(country, 'name.official') || getByPath(country, 'names.common') || getByPath(country, 'name.common') || getByPath(country, 'name') || '');
  const translatedFlagAlt = getByPath(country, 'translations.lav.alt') || getByPath(country, 'translations.lv.alt') || await translateToLatvian(getByPath(country, 'flag.description') || getByPath(country, 'flags.alt') || '');

  return {
    common: translatedCommon,
    official: translatedOfficial,
    alt: translatedFlagAlt
  };
};
