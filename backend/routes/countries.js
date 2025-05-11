import express from 'express';
import Country from '../models/Country.js';

const router = express.Router();

// Get all countries
router.get('/', async (req, res) => {
  console.log('Received GET request for /api/countries');
  try {
    const countries = await Country.find();
    console.log(`Found ${countries.length} countries`);
    res.json(countries);
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ message: 'Error fetching countries', error: err.message });
  }
});

// Add a new country
router.post('/', async (req, res) => {
  const country = new Country({
    name: req.body.name,
    capital: req.body.capital,
    population: req.body.population,
    languages: req.body.languages,
    timezone: req.body.timezone
  });

  try {
    const newCountry = await country.save();
    res.status(201).json(newCountry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;