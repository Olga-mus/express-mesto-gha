const { notFound } = require('../utils/statusResponse');

class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = notFound;
  }
}

module.exports = NotFound;
