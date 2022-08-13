const { checkToken } = require('../helpers/jwt');

const Unauthorized = require('../errors/error401');

// eslint-disable-next-line consistent-return
const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    // throwUnauthorizedError();
    next(new Unauthorized('Авторизуйтесь для доступа'));

    return;
  }

  let payload;
  const token = auth.replace('Bearer ', '');

  try {
    payload = checkToken(token);
  } catch (err) {
    next(new Unauthorized('Необходима авторизация'));
  }
  req.user = payload;
  next();
};

module.exports = { isAuthorized };
