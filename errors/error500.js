const { conflict } = require('../utils/statusResponse');

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = conflict;
  }
}

module.exports = InternalServerError;
