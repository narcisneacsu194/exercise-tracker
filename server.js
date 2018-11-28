require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const moment = require('moment');
require('./db/mongoose');
const { User } = require('./models/user');
const { Exercise } = require('./models/exercise');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/exercise/new-user', (req, res) => {
    const username = req.body.username;
    if(username.trim().length === 0){
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
    let username;
    let date;
    let format = 'ddd MMM DD YYYY';
    User.findById(body.userId).then((user) => {
        if(!user){
            return res.status(400).send('unknown _id');
        }
        username = user.username;

        if(!body.date){
            date = moment().format(format);
        }else{
            date = moment(body.date).format(format);
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

        const finalExercise = new Exercise({
            username,
            description: exercise.description,
            duration: exercise.duration,
            userId: exercise.userId.toString(),
            date: exercise.date
        });

        res.send(finalExercise);
    }).catch((err) => {
        res.status(400).send(`Something went wrong -> ${err}`);
    });
});

app.listen(port, () => {
    console.log(`Server started up on port ${port}`);
});
  
module.exports = { app };