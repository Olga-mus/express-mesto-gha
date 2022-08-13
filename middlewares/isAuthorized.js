const { checkToken } = require('../helpers/jwt');

const User = require('../models/user');

const Unauthorized = require('../errors/error401');

// eslint-disable-next-line consistent-return
const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    // throwUnauthorizedError();
    next(new Unauthorized('Авторизуйтесь для доступа'));

    return;
  }

  const token = auth.replace('Bearer ', '');

  try {
    const payload = checkToken(token);
    // проверить пользователя
    User.findOne({ id: payload.id })
      // eslint-disable-next-line consistent-return
      .then((user) => {
        if (!user) {
          next(new Unauthorized('Авторизуйтесь для доступа'));
        }
        req.user = { id: user._id.toString() };
        next();
      });
  } catch (err) {
    next(err);
  }
};
module.exports = { isAuthorized };
