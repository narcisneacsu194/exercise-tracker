const mongoose = require('mongoose');
const _ = require('lodash');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

function toJSON() {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['username']);
}

UserSchema.methods.toJSON = toJSON;

const User = mongoose.model('User', UserSchema);

module.exports = { User };
