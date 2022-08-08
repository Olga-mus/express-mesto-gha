/* eslint-disable consistent-return */
// это файл контроллеров
const bcrypt = require('bcryptjs'); // импортируем bcrypt

const User = require('../models/user');

const MONGO_DUPLICATE_ERROR_CODE = 11000;
const SALT_ROUNDS = 10;

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

  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => {
      console.log(hash);
      return User.create({
        name,
        about,
        avatar,
        email,
        password: hash, // записываем хеш в базу,
      });
    })
    // пользователь создан
    .then((user) => res.status(201).send({
      data: user,
    }))
    .catch((err) => {
      if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        res.status(409).send({ message: 'Email занят' });
      }
      res.status(500).send({ message: 'Что-то пошло не так' });
    });

  // // ищем пользователя по емэйлу, если нашли - делаем ошибку
  // User.findOne({ email })
  //   .then((user) => {
  //     if (user) {
  //       res.status(409).send({ message: 'Email занят' });
  //     }
  //     // если нет пользователя с таким емэйлом - создаем
  //     return User.create({
  //       name,
  //       about,
  //       avatar,
  //       email,
  //       password,
  //     })
  //       .then((newUser) => {
  //         console.log(newUser);
  //         res.send({ message: 'Пользователь создан' });
  //       });
  //   });

  // return res.send({ message: 'register' });
};

// eslint-disable-next-line arrow-body-style
module.exports.login = (req, res) => {
  const { email, password } = req.body;
  // если емэйл и пароль отсутствует - возвращаем ошибку
  if (!email || !password) {
    return res.status(400).send({ message: 'Email или пароль не переданы' });
  }
  User
    .findOne({ email })
    .select('+password')
    .then((user) => {
      console.log(user);
      // если нет пользователя
      if (!user) {
        res.status(403).send({ message: 'Неправильный Email или пароль' });
      }
      // сравниваем хэш с переданным паролем
      return bcrypt.compare(password, user.password); // переданный пароль и паролт из БД
    })
    .then((isPasswordCorrect) => {
      if (!isPasswordCorrect) {
        return res.status(403).send({ message: 'Неправильный Email или пароль' });
      }
      console.log('password!');
      return res.send({ message: '123' });
    })
    .catch((err) => {
      res.status(500).send({ message: 'Что-то пошло не так' });
    });
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
