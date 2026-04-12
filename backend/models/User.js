const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,

  tokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number,
  },

  sheets: {
    spreadsheetId: String,
  },

  plan: {
    type: String,
    default: "FREE" 
  },

  planExpiresAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('User', userSchema);