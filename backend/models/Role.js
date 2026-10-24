const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  badge: {
    type: String,
    default: 'Configured',
    trim: true
  },
  icon: {
    type: String,
    default: '🛡️'
  },
  color: {
    type: String,
    default: '#0284c7'
  },
  bgColor: {
    type: String,
    default: '#f0f9ff'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  defaultPermissions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  hasPanelMemberAccess: {
    type: Boolean,
    default: false
  },
  permissionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
