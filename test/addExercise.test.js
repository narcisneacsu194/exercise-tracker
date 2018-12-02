const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Exercise } = require('../models/exercise');
const { populateUserCollection, populateExerciseCollection } = require('./database/populateDatabase');

beforeEach(populateUserCollection);
beforeEach(populateExerciseCollection);

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
