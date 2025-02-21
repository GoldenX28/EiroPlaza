// Backend: Node.js with Express.js (server.js)
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  favoriteCountries: [String]
});

const User = mongoose.model('User', UserSchema);

app.get('/', (req, res) => {
  res.send('API is running');
});

// Placeholder for future API integration
app.get('/api/weather/:country', (req, res) => {
  res.json({ message: `Weather API for ${req.params.country} will be integrated soon.` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});