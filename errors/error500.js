const { serverError } = require('../utils/statusResponse');

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = serverError;
  }
}

module.exports = InternalServerError;
