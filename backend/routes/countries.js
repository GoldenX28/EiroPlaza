import express from 'express';
import Country from '../models/Country.js';
import Guest from '../models/Guest.js';
import { ensureCountriesAvailable, normalizeCountryPayload, syncCountriesFromRestCountries } from '../services/restCountries.js';

const router = express.Router();

// Get all countries
router.get('/', async (req, res) => {
  try {
    await ensureCountriesAvailable(Country);
    const countries = await Country.find().sort({ name: 1 });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching countries', error: err.message });
  }
});

// Search countries route
router.get('/search', async (req, res) => {
  try {
    await ensureCountriesAvailable(Country);

    const { query, isCompleteSearch } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Perform the search
    const countries = await Country.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { capital: { $regex: query, $options: 'i' } },
        { continent: { $regex: query, $options: 'i' } },
        { region: { $regex: query, $options: 'i' } },
        { subregion: { $regex: query, $options: 'i' } },
        { 'currency.name': { $regex: query, $options: 'i' } }
      ]
    }).sort({ name: 1 });

    // Log the search query for the guest only if it's a complete search
    if (req.guestId && isCompleteSearch === 'true') {
      try {
        await Guest.findByIdAndUpdate(req.guestId, {
          $push: { searchHistory: { query, timestamp: new Date() } }
        });
        console.log('Search history logged successfully');
      } catch (error) {
        console.error('Error logging search history:', error);
      }
    }

    res.json(countries);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching countries', error: error.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const countries = await syncCountriesFromRestCountries(Country, { force: true });
    res.json({ message: 'Countries synchronized successfully', count: countries.length });
  } catch (err) {
    res.status(500).json({ message: 'Error syncing countries', error: err.message });
  }
});

// Get one country
router.get('/:id', async (req, res) => {
  try {
    await ensureCountriesAvailable(Country);
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.json(country);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching country', error: err.message });
  }
});

// Add a new country
router.post('/', async (req, res) => {
  const country = new Country(normalizeCountryPayload(req.body));

  try {
    const newCountry = await country.save();
    res.status(201).json(newCountry);
  } catch (err) {
    res.status(400).json({ message: 'Error creating country', error: err.message });
  }
});

// Update one country
router.patch('/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    Object.assign(country, normalizeCountryPayload({ ...country.toObject(), ...req.body }));
    const updatedCountry = await country.save();
    res.json(updatedCountry);
  } catch (err) {
    res.status(400).json({ message: 'Error updating country', error: err.message });
  }
});

// Delete one country
router.delete('/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    await country.remove();
    res.json({ message: 'Country deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting country', error: err.message });
  }
});

export default router;