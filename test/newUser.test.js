const expect = require('expect');
const request = require('supertest');
const { app } = require('../server');
const { User } = require('../models/user');
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
