const { conflict } = require('../utils/statusResponse');

class Conflict extends Error {
  constructor(message) {
    super(message);
    this.statusCode = conflict;
  }
}

module.exports = Conflict;
