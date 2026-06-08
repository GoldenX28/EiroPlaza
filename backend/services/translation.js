const TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=lv&dt=t&q=';

const cache = new Map();

const normalizeText = (value) => String(value || '').trim();

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
  const translatedCommon = country?.translations?.lav?.common || country?.translations?.lv?.common || await translateToLatvian(country?.name?.common || country?.name?.official || country?.name || '');
  const translatedOfficial = country?.translations?.lav?.official || country?.translations?.lv?.official || await translateToLatvian(country?.name?.official || country?.name?.common || country?.name || '');
  const translatedFlagAlt = country?.translations?.lav?.alt || country?.translations?.lv?.alt || await translateToLatvian(country?.flags?.alt || '');

  return {
    common: translatedCommon,
    official: translatedOfficial,
    alt: translatedFlagAlt
  };
};
