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

  //   try {
  //     const payload = checkToken(token);
  //     // проверить пользователя
  //     User.findOne({ _id: payload._id }) // _id в БД
  //       // eslint-disable-next-line consistent-return
  //       .then((user) => {
  //         if (!user) {
  //           next(new Unauthorized('Авторизуйтесь для доступа'));
  //         }
  //         req.user = { id: user._id.toString() };
  //         next();
  //       });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  try {
    payload = checkToken(token);
  } catch (err) {
    // eslint-disable-next-line consistent-return
    return next(new Unauthorized('Необходима авторизация'));
  }
  req.user = payload;
  next();
};

module.exports = { isAuthorized };
