// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  token: {
    type: String,
    default: null
  },
  tokenExpiry: {
    type: Date,
    default: null
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500
    }
  },
  dna: {
    learningStyle: {
      type: String,
      enum: ['Visual', 'Textual', 'Socratic'],
      default: 'Textual'
    },
    weaknesses: [{
      type: String
    }],
    strengths: [{
      type: String
    }],
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1,
      immutable: true
    },
    rank: {
      type: String,
      enum: ['Novice', 'Scholar', 'Researcher', 'Professor', 'Nobel'],
      default: 'Novice'
    },
    badges: [{
      name: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    streakDays: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    }
  },
  settings: {
    theme: {
      type: String,
      default: 'dark'
    },
    aiModel: {
      type: String,
      default: 'mistralai/mistral-7b-instruct:free'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Calculate level based on XP
userSchema.virtual('calculatedLevel').get(function() {
  return Math.floor(Math.sqrt(this.dna.xp / 100)) + 1;
});

// Calculate rank based on level
userSchema.virtual('calculatedRank').get(function() {
  const level = this.calculatedLevel;
  if (level >= 50) return 'Nobel';
  if (level >= 30) return 'Professor';
  if (level >= 15) return 'Researcher';
  if (level >= 5) return 'Scholar';
  return 'Novice';
});

// Pre-save hook to update level and rank
userSchema.pre('save', function(next) {
  if (this.isModified('dna.xp')) {
    this.dna.level = this.calculatedLevel;
    this.dna.rank = this.calculatedRank;
  }
  next();
});

// Index for efficient queries
userSchema.index({ token: 1, tokenExpiry: 1 });

module.exports = mongoose.model('User', userSchema);