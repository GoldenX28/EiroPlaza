import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  cca2: {
    type: String,
    default: ''
  },
  ccn3: {
    type: String,
    default: ''
  },
  cioc: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  officialName: {
    type: String,
    default: ''
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
  timezones: {
    type: [String],
    default: []
  },
  primaryTimezone: {
    type: String,
    default: ''
  },
  primaryUtcOffset: {
    type: String,
    default: ''
  },
  continent: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  subregion: {
    type: String,
    default: ''
  },
  flag: {
    type: String,
    default: ''
  },
  flags: {
    png: String,
    svg: String,
    alt: String
  },
  maps: {
    googleMaps: String,
    openStreetMaps: String
  },
  capitalInfo: {
    latlng: [Number]
  },
  latlng: {
    type: [Number],
    default: []
  },
  area: {
    type: Number,
    default: 0
  },
  borders: {
    type: [String],
    default: []
  },
  tld: {
    type: [String],
    default: []
  },
  altSpellings: {
    type: [String],
    default: []
  },
  independent: {
    type: Boolean,
    default: null
  },
  landlocked: {
    type: Boolean,
    default: null
  },
  status: {
    type: String,
    default: ''
  },
  unMember: {
    type: Boolean,
    default: null
  },
  startOfWeek: {
    type: String,
    default: ''
  },
  fifa: {
    type: String,
    default: ''
  },
  car: {
    signs: {
      type: [String],
      default: []
    },
    side: {
      type: String,
      default: ''
    }
  },
  coatOfArms: {
    png: String,
    svg: String
  },
  gini: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  demonyms: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  postalCode: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  currency: {
    name: String,
    code: String
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
}, { timestamps: true });

export default mongoose.model('Country', CountrySchema);