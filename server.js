require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');
const _ = require('lodash');
require('./db/mongoose');
const { User } = require('./models/user');
const { Exercise } = require('./models/exercise');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/exercise/new-user', (req, res) => {
    const username = req.body.username;
    if(!username || username.trim().length === 0){
        return res.status(400).send('Path `username` is required.');
    }

    return User.findOne({
        username
    }).then((user) => {
        if(user){
            return res.status(400).send('username already taken');
        }

        let userFinal = new User({
            username
        });
    
        return userFinal.save();
    }).then((user) => {
        if(!user.username)return;
        let id = user._id;
        id = id.toString();
        user = {
            username,
            _id: id
        };
        res.send(user);
    }).catch((err) => {
        res.status(400).send(`The following error occured: ${err}`);
    });
});

app.post('/api/exercise/add', (req, res) => {
    const body = req.body;

    const result = validateResponse(body, res);
    if(result){
        return result;
    }

    let username;
    let date;
    let dateVar;
    let format = 'ddd MMM DD YYYY';
    User.findById(body.userId).then((user) => {
        if(!user){
            return res.status(400).send('unknown _id');
        }
        username = user.username;

        if(!body.date){
          dateVar = moment();
          date = new Date(dateVar.valueOf());
          date.setTime(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
        }else{
          dateVar = moment(body.date);
          date = new Date(dateVar.valueOf());
          date.setTime(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
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
        if(!exercise.description)return;

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
    if(!q.userId || q.userId.length === 0){
      return res.status(400).send('unknown userId');
    }

    let username;
    User.findById(q.userId).then((user) => {
        if(!user){
          return res.status(400).send('unknown userId');
        }

        username = user.username;

        if(q.from && moment(q.from).isValid()){
          let dateVar = moment(q.from);
          let dbDate = new Date(dateVar.valueOf());
          dbDate.setTime(dbDate.getTime() - (dbDate.getTimezoneOffset() * 60 * 1000));
          return Exercise.find({
              userId: q.userId,
              date: {
                  $gte: dbDate
              }
          });
        }

        return Exercise.find({ userId: q.userId });
    }).then((exercises) => {
        if (!(exercises instanceof Array)) return;
        let newExerciseArr = exercises.map((exercise) => {
            return _.pick(exercise, ['description', 'duration', 'date']);
        });
        newExerciseArr = newExerciseArr.map((exercise) => {
            exercise.date = moment(exercise.date).format('ddd MMM DD YYYY');
            return exercise;
        });
        let finalExerciseArr = [];

        if(q.limit && q.limit !== 0){
            let limit = Math.abs(q.limit);
            let i = 0;
            while(i < limit){
              finalExerciseArr[i] = newExerciseArr[i];
              i++;
            }
        }

        const response = {
            _id: q.userId,
            username,
            count: finalExerciseArr.length === 0 ? newExerciseArr.length : 
                finalExerciseArr.length,
            log: finalExerciseArr.length === 0 ? newExerciseArr : 
                finalExerciseArr
        };

        res.send(response);
    }).catch((err) => {
      res.status(400).send(`Something went wrong -> ${err}`);    
    });    
});

const validateResponse = (body, res) => {
    if(!body.userId || body.userId.trim().length === 0){
        return res.status(400).send('unknown _id');
    }
    
    if(!body.description || body.description.trim().length === 0){
        return res.status(400).send('Path `description` is required.');
    }

    if(!body.duration){
        return res.status(400).send('Path `duration` is required.');
    }

    if(body.duration < 1){
        return res.status(400).send('duration too short');
    }

    if(isNaN(body.duration)){
        return res.status(400).send(`Cast to Number failed for value "${body.duration}" at path "duration"`);
    }

    if (body.date && !moment(body.date).isValid()) {
        return res.status(400).send(`Cast to Date failed for value "${body.date}" at path "date"`);
    }

    return null;
};

app.listen(port, () => {
    console.log(`Server started up on port ${port}`);
});
  
module.exports = { app };