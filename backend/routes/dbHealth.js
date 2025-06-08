import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = {
    main: { connected: false, error: null },
    countries: { connected: false, error: null },
    users: { connected: false, error: null }
  };

  // Check main connection
  if (mongoose.connection.readyState === 1) {
    dbStatus.main.connected = true;
  } else {
    dbStatus.main.error = 'Not connected';
  }

  // Check collections
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('countries')) {
      dbStatus.countries.connected = true;
    } else {
      dbStatus.countries.error = 'Collection not found';
    }

    if (collectionNames.includes('users')) {
      dbStatus.users.connected = true;
    } else {
      dbStatus.users.error = 'Collection not found';
    }
  } catch (error) {
    console.error('Error checking collections:', error);
    dbStatus.countries.error = error.message;
    dbStatus.users.error = error.message;
  }

  res.json(dbStatus);
});

export default router;