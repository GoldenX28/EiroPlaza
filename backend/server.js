import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Country from './models/Country.js';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import dbHealthRoutes from './routes/dbHealth.js';  
import adminRoutes from './routes/admin.js';
import inquiryRoutes from './routes/inquiries.js';
import postRoutes from './routes/posts.js';
import newsRoutes from './routes/news.js';
import { syncCountriesFromRestCountries } from './services/restCountries.js';
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
async function bootstrap() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    if (process.env.REST_COUNTRIES_API_KEY) {
      try {
        await syncCountriesFromRestCountries(Country);
        console.log('Countries synchronized from REST Countries API');
      } catch (syncError) {
        console.error('REST Countries sync failed:', syncError);
      }
    } else {
      console.warn('Skipping REST Countries sync because REST_COUNTRIES_API_KEY is not set.');
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

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

// Use news routes
app.use('/api/news', newsRoutes);

// Get user count
app.get('/api/user-count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting users', error: error.message });
  }
});

bootstrap();
