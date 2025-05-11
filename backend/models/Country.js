import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  capital: {
    type: String,
    required: true
  },
  population: {
    type: String,
    required: true
  },
  languages: {
    type: [String],
    required: true
  },
  timezone: {
    type: String,
    required: true
  }
});

export default mongoose.model('Country', CountrySchema);