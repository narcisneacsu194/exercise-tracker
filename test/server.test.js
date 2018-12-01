const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { User } = require('../models/user');
const { Exercise } = require('../models/exercise');
const { populateUserCollection, populateExerciseCollection } = require('./database/populateDatabase');

beforeEach(populateUserCollection);
beforeEach(populateExerciseCollection);

describe('POST /api/exercise/new-user', () => {
  it('should create a new user', (done) => {
    const user = {
      username: 'admin2'
    };
    request(app)
      .post('/api/exercise/new-user')
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.body.username).toBe(user.username);
        expect(res.body._id).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.findOne(user).then((userDb) => {
          expect(userDb.username).toBe(user.username);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message that the username field is required', (done) => {
    const user = {
      property: 'property'
    };
    request(app)
      .post('/api/exercise/new-user')
      .send(user)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('Path `username` is required.');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.findOne(user).then((userDb) => {
          expect(userDb).toBeFalsy();
          done();
        }).catch(error => done(error));
      });
  });

  it('should return username already taken message', (done) => {
    const user = {
      username: 'admin1'
    };

    request(app)
      .post('/api/exercise/new-user')
      .send(user)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('username already taken');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.find({}).then((users) => {
          expect(users.length).toBe(1);
          done();
        }).catch(error => done(error));
      });
  });
});

describe('POST /api/exercise/add', () => {
  it('should add a new exercise for a user which contains current date', (done) => {
    const userId = process.env.DB_USER_ID;
    const username = process.env.DB_USER_NAME;

    const exercise = {
      userId,
      description: 'Description 1',
      duration: 123
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(200)
      .expect((res) => {
        expect(res.body.username).toBe(username);
        expect(res.body.description).toBe(exercise.description);
        expect(res.body.duration).toBe(exercise.duration);
        expect(res.body.userId).toBe(exercise.userId);
        expect(res.body.date).toBe(moment().format('ddd MMM DD YYYY'));
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          const dbExercise = exercises[exercises.length - 1];
          const date = new Date(moment().valueOf());
          const formattedDate = moment(date).format('ddd MMM DD YYYY HH:mm');
          const formattedDbDate = moment(dbExercise.date).format('ddd MMM DD YYYY HH:mm');

          expect(dbExercise.username).toBe(process.env.DB_USER_NAME);
          expect(dbExercise.userId.toString()).toBe(process.env.DB_USER_ID);
          expect(dbExercise.description).toBe(exercise.description);
          expect(dbExercise.duration).toBe(exercise.duration);
          expect(formattedDbDate).toBe(formattedDate);

          done();
        }).catch(error => done(error));
      });
  });

  it('should add a new exercise for a user which contains specific date', (done) => {
    const userId = process.env.DB_USER_ID;
    const username = process.env.DB_USER_NAME;

    const exercise = {
      userId,
      description: 'Description 1',
      duration: 123,
      date: '2018-05-01'
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(200)
      .expect((res) => {
        expect(res.body.username).toBe(username);
        expect(res.body.description).toBe(exercise.description);
        expect(res.body.duration).toBe(exercise.duration);
        expect(res.body.userId).toBe(exercise.userId);
        expect(res.body.date).toBe(moment(exercise.date).format('ddd MMM DD YYYY'));
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          const dbExercise = exercises[exercises.length - 1];
          const date = new Date(moment('2018-05-01').valueOf());
          const formattedDate = moment(date).format('ddd MMM DD YYYY HH:mm');
          const formattedDbDate = moment(dbExercise.date).format('ddd MMM DD YYYY HH:mm');

          expect(dbExercise.username).toBe(process.env.DB_USER_NAME);
          expect(dbExercise.userId.toString()).toBe(process.env.DB_USER_ID);
          expect(dbExercise.description).toBe(exercise.description);
          expect(dbExercise.duration).toBe(exercise.duration);
          expect(formattedDbDate).toBe(formattedDate);

          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if no userId is provided', (done) => {
    const exercise = {
      description: 'Description 1',
      duration: 123
    };
    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('unknown _id');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if empty userId is provided', (done) => {
    const exercise = {
      userId: ' ',
      description: 'Description 1',
      duration: 123
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('unknown _id');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if a non-existent userId is provided', (done) => {
    const exercise = {
      userId: new ObjectID().toString(),
      description: 'Description 1',
      duration: 123
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('unknown _id');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if a userId with an invalid format is provided', (done) => {
    const exercise = {
      userId: '1',
      description: 'Description 1',
      duration: 123
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided userId has an invalid format.');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if no description is provided', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      duration: 123
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('Path `description` is required.');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if empty description is provided', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      description: ' ',
      duration: 123
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('Path `description` is required.');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if duration is not provided', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      description: 'Description 1'
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('Path `duration` is required.');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if duration is less than 1', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      description: 'Description 1',
      duration: 0
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('duration too short');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if duration is not a number', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      description: 'Description 1',
      duration: 'Not a number'
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`Cast to Number failed for value "${exercise.duration}" at path "duration"`);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if duration is not a number', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      description: 'Description 1',
      duration: 'Not a number'
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`Cast to Number failed for value "${exercise.duration}" at path "duration"`);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if the provided date is invalid', (done) => {
    const exercise = {
      userId: process.env.DB_USER_ID,
      description: 'Description 1',
      duration: 123,
      date: 'Invalid date'
    };

    request(app)
      .post('/api/exercise/add')
      .send(exercise)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`Cast to Date failed for value "${exercise.date}" at path "date"`);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Exercise.find({}).then((exercises) => {
          expect(exercises.length).toBe(5);
          done();
        }).catch(error => done(error));
      });
  });
});

describe('GET /api/exercise/log', () => {
  it('should return all the exercises of a given user', (done) => {
    const userId = process.env.DB_USER_ID;

    request(app)
      .get(`/api/exercise/log?userId=${userId}`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(5);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(5);
        expect(firstElem.description).toBe('Description 1');
        expect(firstElem.duration).toBe(1);
        expect(firstElem.date).toBe('Wed Mar 02 2050');
      })
      .end(done);
  });

  it('should return a limited amount of exercises', (done) => {
    const userId = process.env.DB_USER_ID;

    request(app)
      .get(`/api/exercise/log?userId=${userId}&limit=2`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];
        const secondElem = res.body.log[1];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(2);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(2);

        expect(firstElem.description).toBe('Description 1');
        expect(firstElem.duration).toBe(1);
        expect(firstElem.date).toBe('Wed Mar 02 2050');

        expect(secondElem.description).toBe('Description 2');
        expect(secondElem.duration).toBe(20);
        expect(secondElem.date).toBe('Sun Mar 02 2025');
      })
      .end(done);
  });

  it('should return exercises after a certain date', (done) => {
    const userId = process.env.DB_USER_ID;
    const date = '2018-11-29';

    request(app)
      .get(`/api/exercise/log?userId=${userId}&from=${date}`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];
        const secondElem = res.body.log[1];
        const thirdElem = res.body.log[2];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(3);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(3);

        expect(firstElem.description).toBe('Description 1');
        expect(firstElem.duration).toBe(1);
        expect(firstElem.date).toBe('Wed Mar 02 2050');

        expect(secondElem.description).toBe('Description 2');
        expect(secondElem.duration).toBe(20);
        expect(secondElem.date).toBe('Sun Mar 02 2025');

        expect(thirdElem.description).toBe('Description 3');
        expect(thirdElem.duration).toBe(30);
        expect(thirdElem.date).toBe('Fri Nov 30 2018');
      })
      .end(done);
  });

  it('should return one exercise after a certain date', (done) => {
    const userId = process.env.DB_USER_ID;
    const date = '2018-11-29';

    request(app)
      .get(`/api/exercise/log?userId=${userId}&from=${date}&limit=1`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(1);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(1);

        expect(firstElem.description).toBe('Description 1');
        expect(firstElem.duration).toBe(1);
        expect(firstElem.date).toBe('Wed Mar 02 2050');
      })
      .end(done);
  });

  it('should return exercises before a certain date', (done) => {
    const userId = process.env.DB_USER_ID;
    const date = '2000-04-03';

    request(app)
      .get(`/api/exercise/log?userId=${userId}&to=${date}`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];
        const secondElem = res.body.log[1];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(2);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(2);

        expect(firstElem.description).toBe('Description 4');
        expect(firstElem.duration).toBe(40);
        expect(firstElem.date).toBe('Thu Mar 02 2000');

        expect(secondElem.description).toBe('Description 5');
        expect(secondElem.duration).toBe(60);
        expect(secondElem.date).toBe('Sun Mar 02 1975');
      })
      .end(done);
  });

  it('should return one exercise before a certain date', (done) => {
    const userId = process.env.DB_USER_ID;
    const date = '2000-04-03';

    request(app)
      .get(`/api/exercise/log?userId=${userId}&to=${date}&limit=1`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(1);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(1);

        expect(firstElem.description).toBe('Description 4');
        expect(firstElem.duration).toBe(40);
        expect(firstElem.date).toBe('Thu Mar 02 2000');
      })
      .end(done);
  });

  it('should return exercises within an interval of time', (done) => {
    const userId = process.env.DB_USER_ID;
    const fromDate = '2000-03-01';
    const toDate = '2018-12-01';

    request(app)
      .get(`/api/exercise/log?userId=${userId}&from=${fromDate}&to=${toDate}`)
      .expect(200)
      .expect((res) => {
        const firstElem = res.body.log[0];
        const secondElem = res.body.log[1];

        expect(res.body._id).toBe(userId);
        expect(res.body.username).toBe('admin1');
        expect(res.body.count).toBe(2);
        expect(res.body.log instanceof Array).toBeTruthy();
        expect(res.body.log.length).toBe(2);

        expect(firstElem.description).toBe('Description 3');
        expect(firstElem.duration).toBe(30);
        expect(firstElem.date).toBe('Fri Nov 30 2018');

        expect(secondElem.description).toBe('Description 4');
        expect(secondElem.duration).toBe(40);
        expect(secondElem.date).toBe('Thu Mar 02 2000');
      })
      .end(done);
  });

  it('should return error message if userId not provided as a query param', (done) => {
    request(app)
      .get('/api/exercise/log')
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('unknown userId');
      })
      .end(done);
  });

  it('should return error message if the userId provided has an invalid format', (done) => {
    request(app)
      .get('/api/exercise/log?userId=1')
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided userId has an invalid format.');
      })
      .end(done);
  });

  it('should return error message if a user with the provided id doesn\'t exist', (done) => {
    const id = new ObjectID();
    const idStr = id.toString();

    request(app)
      .get(`/api/exercise/log?userId=${idStr}`)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('unknown userId');
      })
      .end(done);
  });
});
