const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { populateUserCollection, populateExerciseCollection } = require('./database/populateDatabase');

beforeEach(populateUserCollection);
beforeEach(populateExerciseCollection);

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
