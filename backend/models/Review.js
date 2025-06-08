import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure that either user or guest is provided, but not both
ReviewSchema.pre('save', function(next) {
  if ((this.user && this.guest) || (!this.user && !this.guest)) {
    next(new Error('Review must be associated with either a user or a guest, but not both.'));
  } else {
    next();
  }
});

export default mongoose.model('Review', ReviewSchema);