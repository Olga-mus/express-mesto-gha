const { unauthorized } = require('../utils/statusResponse');

class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = unauthorized;
  }
}

module.exports = Unauthorized;
