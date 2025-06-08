import mongoose from 'mongoose';

const GuestSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  visitCount: {
    type: Number,
    default: 1
  },
  searchHistory: [{
    query: String,
    timestamp: Date
  }]
});

export default mongoose.model('Guest', GuestSchema);