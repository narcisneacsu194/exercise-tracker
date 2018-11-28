const mongoose = require('mongoose');
const _ = require('lodash');

const ExerciseSchema = mongoose.Schema({
  userId: {
    type: String,
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
    type: Date
  }
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

module.exports = { Exercise };
