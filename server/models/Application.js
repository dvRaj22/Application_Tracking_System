const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  resumeLink: {
    type: String,
    trim: true,
    default: ''
  },

  status: {
    type: String,
    enum: ['applied', 'interview', 'offer', 'rejected'],
    default: 'applied'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // appliedDate field removed - using createdAt from timestamps instead
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Update lastUpdated when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastUpdated = new Date();
  }
  next();
});

// Index for efficient queries
applicationSchema.index({ status: 1, role: 1, recruiter: 1 });

module.exports = mongoose.model('Application', applicationSchema);
