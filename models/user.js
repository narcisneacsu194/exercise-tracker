const mongoose = require('mongoose');
const _ = require('lodash');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
