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

function toJSON() {
  const exercise = this;
  const exerciseObject = exercise.toObject();
  return _.pick(exerciseObject, ['username', 'description', 'duration', 'userId', 'date']);
}
  
ExerciseSchema.methods.toJSON = toJSON;

const Exercise = mongoose.model('Exercise', ExerciseSchema);

module.exports = { Exercise };
