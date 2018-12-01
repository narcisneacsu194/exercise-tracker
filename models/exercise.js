const mongoose = require('mongoose');
const _ = require('lodash');

const ExerciseSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
      type: String,
      required: true
  },
  duration: {
      type: Number,
      required: true
  },
  date: {
    type: Date,
    required: true
  }
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

module.exports = { Exercise };
