// это файл контроллеров
const User = require('../models/user');

const {
  created,
  badRequest,
  notFound,
  serverError,
} = require('../utils/statusResponse');

// Получаем всех пользователей 500
module.exports.getUsers = (req, res) => {
  User.find({}) // найти вообще всех
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(serverError).send({ message: err.message }));
};

// Получаем текущего пользователя 404
module.exports.getCurrentUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      const error = new Error();
      error.statusCode = notFound;
      throw error;
    })
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(badRequest).send({ message: 'Невалидный идентификатор для пользователя' });
      } else if (err.statusCode === notFound) {
        res.status(notFound).send({ message: 'Такого пользователя нет' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};

// создает пользователя
// module.exports.createUser = (req, res) => {
// получим из объекта запроса имя и описание пользовател
//   const { name, about, avatar } = req.body;
//   User.create({ name, about, avatar }) // создадим документ на основе пришедших данных
//     .then((user) => res.status(created).send({ data: user })) // вернём записанные в базу данные
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         res.status(badRequest).send({ message: 'Данные введены не корректно' });
//       } else {
//         res.status(serverError).send({ message: err.message });
//       }
//     });
// };

// дорабатываем контроллер создание пользователя
// eslint-disable-next-line arrow-body-style
module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  // если емэйл и пароль отсутствует - возвращаем ошибку
  if (!email || !password) {
    return res.status(400).send({ message: 'Email или пароль не переданы' });
  }

  // ищем пользователя по емэйлу, если нашли - делаем ошибку
  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.status(409).send({ message: 'Email занят' });
      }
      // если нет пользователя с таким емэйлом - создаем
      return User.create({
        name,
        about,
        avatar,
        email,
        password,
      })
        .then((newUser) => {
          console.log(newUser);
          res.send({ message: 'Пользователь создан' });
        });
    });

  // return res.send({ message: 'register' });
};

// eslint-disable-next-line arrow-body-style
module.exports.login = (req, res) => {
  return res.send({ message: 'login' });
};

// обновляем данные пользователя
module.exports.patchProfile = (req, res) => {
  const { name, about } = req.body; // получим из объекта запроса имя и описание пользовател
  // обновим имя найденного по _id пользователя
  const opts = { runValidators: true, new: true };
  User.findByIdAndUpdate(req.user._id, { name, about }, opts)
    .orFail(() => {
      const error = new Error();
      error.statusCode = notFound;
      throw error;
    })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(badRequest).send({ message: 'Данные введены не корректно' });
      } else if (err.statusCode === notFound) {
        res.status(notFound).send({ message: 'Такого пользователя нет' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};

// обновляем аватар пользователя
module.exports.patchAvatar = (req, res) => {
  const { avatar } = req.body; // получим из объекта запроса имя и описание пользовател
  // обновим имя найденного по _id пользователя
  const opts = { runValidators: true, new: true };
  User.findByIdAndUpdate(req.user._id, { avatar }, opts)
    .orFail(() => {
      const error = new Error();
      error.statusCode = notFound;
      throw error;
    })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(badRequest).send({ message: 'Данные введены не корректно' });
      } else if (err.statusCode === notFound) {
        res.status(notFound).send({ message: 'Такого пользователя нет' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};
