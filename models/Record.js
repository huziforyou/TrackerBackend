const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  selfie: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  browserInfo: {
    browserName: String,
    os: String,
    screenResolution: String,
    language: String,
    timeZone: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Record', recordSchema);
