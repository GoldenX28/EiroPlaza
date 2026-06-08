import express from 'express';
import { fetchNewsData } from '../services/newsData.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { country, query, nextPage, size } = req.query;

    if (!country && !query) {
      return res.status(400).json({ message: 'Country code or query is required' });
    }

    const news = await fetchNewsData({
      countryCode: country,
      query,
      nextPage,
      size: Number(size) || 6
    });

    res.json(news);
  } catch (error) {
    const status = error.message.includes('NEWSDATA_API_KEY') ? 503 : 502;
    res.status(status).json({ message: 'Error fetching news', error: error.message });
  }
});

export default router;