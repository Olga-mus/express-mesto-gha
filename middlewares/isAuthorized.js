const { checkToken } = require('../helpers/jwt');

const User = require('../models/user');

const Unauthorized = require('../errors/error401');

// eslint-disable-next-line consistent-return
const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    // throwUnauthorizedError();
    next(new Unauthorized('Авторизуйтесь для доступа'));

    return; // ???
    // return res.status(401).send({ message: 'Авторизуйтесь для доступа' });
  }

  const token = auth.replace('Bearer ', '');

  try {
    const payload = checkToken(token);
    // проверить пользователя
    User.findOne({ email: payload.email })
      // eslint-disable-next-line consistent-return
      .then((user) => {
        if (!user) {
          next(new Unauthorized('Авторизуйтесь для доступа'));
          // throwUnauthorizedError();
          // return res.status(401).send({ message: 'Авторизуйтесь для доступа' });
        }
        req.user = { id: user._id };
        next();
      });
  // .catch((err) => {
  //   res.status(500).send({ message: 'Что-то пошло не так' });
  // });
  } catch (err) {
    next(err);
    // throwUnauthorizedError();
    // return res.status(401).send({ message: 'Авторизуйтесь для доступа' });
  }
};
module.exports = { isAuthorized };