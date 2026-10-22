const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // HRMS employees authenticate directly against HRMS; no local password required
      return !this.employeeId;
    }
  },
  role: {
    type: String,
    enum: ['super_admin', 'sub_admin', 'panel_member', 'candidate'],
    required: true
  },
  campus: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'panel_member';
    }
    // Optional for sub_admin - if set, they will only see data for that campus
    // No enum restriction to allow renamed campuses (e.g., "Btech" -> "Engineering")
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  permissions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasPanelMemberAccess: {
    type: Boolean,
    default: false
  },
  profile: {
    phone: String,
    department: String,
    designation: String,
    experience: Number,
    skills: [String]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();

  // If password is already a bcrypt hash (e.g. copied directly from HRMS), do not re-hash it
  if (/^\$2[abxy]\$\d{2}\$[./0-9A-Za-z]{53}$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
