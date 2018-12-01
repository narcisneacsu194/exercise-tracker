const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');

const validateResponse = (body, res) => {
  if (!body.userId || body.userId.trim().length === 0) {
    return res.status(400).send('unknown _id');
  }

  if (!ObjectID.isValid(body.userId)) {
    return res.status(400).send('The provided userId has an invalid format.');
  }

  if (!body.description || body.description.trim().length === 0) {
    return res.status(400).send('Path `description` is required.');
  }

  if (!body.duration && body.duration !== 0) {
    return res.status(400).send('Path `duration` is required.');
  }

  if (body.duration < 1) {
    return res.status(400).send('duration too short');
  }

  if (Number.isNaN(Number(body.duration))) {
    return res.status(400).send(`Cast to Number failed for value "${body.duration}" at path "duration"`);
  }

  if (body.date && !moment(body.date).isValid()) {
    return res.status(400).send(`Cast to Date failed for value "${body.date}" at path "date"`);
  }

  return null;
};

module.exports = { validateResponse };
