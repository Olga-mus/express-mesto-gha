const NotFound = require('../errors/error404');

const pageNotFound = (req, res, next) => {
  next(new NotFound('Маршрут не найден'));
};

module.exports = pageNotFound;
