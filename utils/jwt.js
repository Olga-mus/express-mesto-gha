const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken

const JWT_SECRET = 'some-secret-key';
const User = require('../models/user');

// генерируем токен
// eslint-disable-next-line arrow-body-style
const getJwtToken = (id) => {
  return jwt.sign(
    { id },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
};

// авторизован пользователь или нет
// eslint-disable-next-line arrow-body-style
const isAutorised = (token) => {
  return jwt.verify(token, JWT_SECRET, (err, decoded) => { // в объекте decoded будет id
    if (err) return false;
    return User.findById(decoded.id)
      // eslint-disable-next-line arrow-body-style
      .then((user) => {
        return Boolean(user);
      });
  });
};

module.exports = {
  getJwtToken,
  isAutorised,
};
