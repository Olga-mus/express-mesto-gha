/* eslint-disable consistent-return */
// eslint-disable-next-line import/no-unresolved
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // тут будет вся авторизация
  // достаём авторизационный заголовок
  const { authorization } = req.headers;

  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }
  // извлечём токен
  const token = authorization.replace('Bearer ', '');
  // верифицируем токен
  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    // отправим ошибку, если не получилось
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};

module.exports = auth;
