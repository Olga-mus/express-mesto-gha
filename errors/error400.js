const { badRequest } = require('../utils/statusResponse');

class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = badRequest;
  }
}

module.exports = BadRequest;
