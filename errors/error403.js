const { forbidden } = require('../utils/statusResponse');

class Forbidden extends Error {
  constructor(message) {
    super(message);
    this.statusCode = forbidden;
  }
}

module.exports = Forbidden;
