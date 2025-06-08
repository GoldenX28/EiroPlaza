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
    type: Number,
    required: true
  },
  languages: {
    type: [String],
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  currency: {
    name: String,
    code: String
  },
});

export default mongoose.model('Country', CountrySchema);