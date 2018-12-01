require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');
const _ = require('lodash');
require('./db/mongoose');
const { User } = require('./models/user');
const { Exercise } = require('./models/exercise');
const { validateResponse } = require('./validation/validation.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body;
  if (!username || username.trim().length === 0) {
    return res.status(400).send('Path `username` is required.');
  }

  return User.findOne({
    username
  }).then((user) => {
    if (user) {
      return res.status(400).send('username already taken');
    }

    const userFinal = new User({
      username
    });
    return userFinal.save();
  }).then((user) => {
    if (!user.username) return;
    let id = user._id;
    id = id.toString();
    const finalUser = {
      username,
      _id: id
    };
    res.send(finalUser);
  }).catch((err) => {
    res.status(400).send(`The following error occured: ${err}`);
  });
});

app.post('/api/exercise/add', (req, res) => {
  const { body } = req;

  const result = validateResponse(body, res);
  if (result) {
    return result;
  }

  let username;
  let date;
  let dateVar;
  const format = 'ddd MMM DD YYYY';
  return User.findById(body.userId).then((user) => {
    if (!user) {
      return res.status(400).send('unknown _id');
    }

    username = user.username;

    if (!body.date) {
      dateVar = moment();
      date = new Date(dateVar.valueOf());
    } else {
      dateVar = moment(body.date);
      date = new Date(dateVar.valueOf());
    }

    const exercise = new Exercise({
      username,
      userId: new ObjectID(body.userId),
      description: body.description,
      duration: body.duration,
      date
    });

    return exercise.save();
  }).then((exercise) => {
    if (!exercise.description) return;

    const finalExercise = {
      username,
      description: exercise.description,
      duration: exercise.duration,
      userId: exercise.userId.toString(),
      date: moment(exercise.date).format(format)
    };

    res.send(finalExercise);
  }).catch((err) => {
    res.status(400).send(`Something went wrong -> ${err}`);
  });
});

app.get('/api/exercise/log', (req, res) => {
  const q = req.query;
  if (!q.userId || q.userId.length === 0) {
    return res.status(400).send('unknown userId');
  }

  if (!ObjectID.isValid(q.userId)) {
    return res.status(400).send('The provided userId has an invalid format.');
  }

  let username;
  return User.findById(q.userId).then((user) => {
    if (!user) {
      return res.status(400).send('unknown userId');
    }

    username = user.username;


    if (q.from && moment(q.from).isValid() && q.to && moment(q.to).isValid()) {
      const dateVarFrom = moment(q.from);
      const dbDateFrom = new Date(dateVarFrom.valueOf());
      dbDateFrom.setTime(dbDateFrom.getTime() - (dbDateFrom.getTimezoneOffset() * 60 * 1000));

      const dateVarTo = moment(q.to);
      const dbDateTo = new Date(dateVarTo.valueOf());
      dbDateTo.setTime(dbDateTo.getTime() - (dbDateTo.getTimezoneOffset() * 60 * 1000));

      return Exercise.find({
        userId: q.userId,
        date: {
          $gt: dbDateFrom,
          $lt: dbDateTo
        }
      }).sort('-date');
    }

    if (q.from && moment(q.from).isValid()) {
      const dateVar = moment(q.from);
      const dbDate = new Date(dateVar.valueOf());
      dbDate.setTime(dbDate.getTime() - (dbDate.getTimezoneOffset() * 60 * 1000));
      return Exercise.find({
        userId: q.userId,
        date: {
          $gt: dbDate
        }
      }).sort('-date');
    }

    if (q.to && moment(q.to).isValid()) {
      const dateVar = moment(q.to);
      const dbDate = new Date(dateVar.valueOf());
      dbDate.setTime(dbDate.getTime() - (dbDate.getTimezoneOffset() * 60 * 1000));
      return Exercise.find({
        userId: q.userId,
        date: {
          $lt: dbDate
        }
      }).sort('-date');
    }

    return Exercise.find({ userId: q.userId }).sort('-date');
  }).then((exercises) => {
    if (!(exercises instanceof Array)) return;
    let newExerciseArr = exercises.map(exercise => _.pick(exercise, ['description', 'duration', 'date']));
    newExerciseArr = newExerciseArr.map((exercise) => {
      const newExercise = exercise;
      newExercise.date = moment(exercise.date).format('ddd MMM DD YYYY');
      return newExercise;
    });
    const finalExerciseArr = [];

    if (q.limit && q.limit !== 0 && exercises.length > q.limit) {
      const limit = Math.abs(q.limit);
      let i = 0;
      while (i < limit) {
        finalExerciseArr[i] = newExerciseArr[i];
        i += 1;
      }
    }

    const response = {
      _id: q.userId,
      username,
      count: finalExerciseArr.length === 0 ? newExerciseArr.length : finalExerciseArr.length,
      log: finalExerciseArr.length === 0 ? newExerciseArr : finalExerciseArr
    };

    res.send(response);
  }).catch((err) => {
    res.status(400).send(`Something went wrong -> ${err}`);
  });
});

app.listen(port, () => {
  console.log(`Server started up on port ${port}`);
});

module.exports = { app };
