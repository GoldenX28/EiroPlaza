import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Country from './models/Country.js';
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import dbHealthRoutes from './routes/dbHealth.js';  
import adminRoutes from './routes/admin.js';
import inquiryRoutes from './routes/inquiries.js';
import postRoutes from './routes/posts.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the EiroPlaza API');
});

// Use auth routes
app.use('/api/auth', authRoutes);

// Use countries routes
app.use('/api/countries', countriesRoutes);

// Use db health routes
app.use('/api/db-health', dbHealthRoutes);  // Add this line

// Use admin routes
app.use('/api/admin', adminRoutes);

// Use inquiry routes
app.use('/api/inquiries', inquiryRoutes);

// Use post routes
app.use('/api/posts', postRoutes);

// Routes

// Get all countries
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await Country.find();
    console.log('All countries:', countries);
    res.json(countries);
  } catch (err) {
    console.error('Error fetching all countries:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get one country
app.get('/api/countries/:id', async (req, res) => {
  console.log(`Fetching country with id: ${req.params.id}`);
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log('Invalid ID format');
    return res.status(400).json({ message: 'Invalid country ID format' });
  }

  try {
    const country = await Country.findById(req.params.id);
    console.log('Found country:', country);
    if (!country) {
      console.log('Country not found');
      return res.status(404).json({ message: 'Country not found' });
    }
    res.json(country);
  } catch (err) {
    console.error('Error fetching country:', err);
    res.status(500).json({ message: 'Error fetching country', error: err.message });
  }
});

// Create one country
app.post('/api/countries', async (req, res) => {
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

// Update one country
app.patch('/api/countries/:id', getCountry, async (req, res) => {
  if (req.body.name != null) {
    res.country.name = req.body.name;
  }
  if (req.body.capital != null) {
    res.country.capital = req.body.capital;
  }
  if (req.body.population != null) {
    res.country.population = req.body.population;
  }
  if (req.body.languages != null) {
    res.country.languages = req.body.languages;
  }
  if (req.body.timezone != null) {
    res.country.timezone = req.body.timezone;
  }
  try {
    const updatedCountry = await res.country.save();
    res.json(updatedCountry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete one country
app.delete('/api/countries/:id', getCountry, async (req, res) => {
  try {
    await res.country.deleteOne();
    res.json({ message: 'Deleted Country' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get country by ID
async function getCountry(req, res, next) {
  let country;
  try {
    country = await Country.findById(req.params.id);
    if (country == null) {
      return res.status(404).json({ message: 'Cannot find country' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.country = country;
  next();
}
// Get user count
app.get('/api/user-count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting users', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
