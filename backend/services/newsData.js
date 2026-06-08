const NEWSDATA_ENDPOINT = 'https://newsdata.io/api/1/latest';

export const fetchNewsData = async ({ countryCode, query, nextPage, size = 6 } = {}) => {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    throw new Error('NEWSDATA_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    language: 'en',
    size: String(size)
  });

  if (nextPage) {
    params.set('page', nextPage);
  }

  if (countryCode) {
    params.set('country', countryCode.toLowerCase());
  }

  if (query) {
    params.set('q', query);
  }

  const response = await fetch(`${NEWSDATA_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`NewsData.io request failed with status ${response.status}: ${body}`);
  }

  const payload = await response.json();

  return {
    status: payload.status || 'unknown',
    totalResults: payload.totalResults || 0,
    nextPage: payload.nextPage || null,
    articles: Array.isArray(payload.results)
      ? payload.results.map((article) => ({
          title: article.title || '',
          link: article.link || '',
          pubDate: article.pubDate || '',
          source: article.source_id || article.source || '',
          description: article.description || article.content || '',
          imageUrl: article.image_url || '',
          creator: Array.isArray(article.creator) ? article.creator : [],
          country: article.country || []
        }))
      : []
  };
};