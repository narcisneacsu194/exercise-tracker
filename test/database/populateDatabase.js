const { User } = require('../../models/user');
const { Exercise } = require('../../models/exercise');

const user = {
    "username": "admin1"
};

let exercises = [
    {
       description: "Description 1",
       duration: 1,
       date: "2050-03-02"
    },
    {
        description: "Description 2",
        duration: 20,
        date: "2025-03-02"
    },
    {
        description: "Description 3",
        duration: 30,
        date: "2018-11-30"
    },
    {
        description: "Description 4",
        duration: 40,
        date: "2000-03-02"
    },
    {
        description: "Description 5",
        duration: 60,
        date: "1975-03-02"
    }
];

const populateUserCollection = (done) => {
    User.remove({}).then(() => {
        User.insertMany(user).then((user) => {
          process.env.DB_USER_ID = user[0].id;
          process.env.DB_USER_NAME = user[0].username;
          return done();
        });
    });
};

const populateExerciseCollection = (done) => {
  const userId = process.env.DB_USER_ID;
  const username = process.env.DB_USER_NAME;
  exercises = exercises.map((exercise) => {
    exercise.userId = userId;
    exercise.username = username;
    return exercise;
  });

  Exercise.remove({}).then(() => {
    Exercise.insertMany(exercises).then(() => done());
  });
};

module.exports = { populateUserCollection, populateExerciseCollection };