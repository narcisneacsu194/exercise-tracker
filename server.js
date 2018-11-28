require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
require('./db/mongoose');
const { User } = require('./models/user');

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

app.listen(port, () => {
    console.log(`Server started up on port ${port}`);
});
  
module.exports = { app };