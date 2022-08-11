/* eslint-disable consistent-return */
// это файл контроллеров
const bcrypt = require('bcryptjs'); // импортируем bcrypt

// const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');

const SALT_ROUNDS = 10;
const { generateToken } = require('../helpers/jwt');
const BadRequest = require('../errors/error400');
const Forbidden = require('../errors/error403');
const NotFound = require('../errors/error404');
const Unauthorized = require('../errors/error401');
const Conflict = require('../errors/error409');
const InternalServerError = require('../errors/error500');

const {
  ok,
  created,
  MONGO_DUPLICATE_ERROR_CODE,
} = require('../utils/statusResponse');

// Получаем всех пользователей 500
module.exports.getUsers = (req, res, next) => {
  User.find({}) // найти вообще всех
    .then((users) => res.send({ data: users }))
    // .catch((err) => res.status(serverError).send({ message: err.message }));
    .catch(next);
};

// Получаем текущего пользователя по id 404
module.exports.getCurrentUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      // eslint-disable-next-line no-new
      new NotFound('Нет пользователя с таким id');
      // const error = new Error('Нет пользователя с таким id');
      // error.statusCode = notFound;
      // throw error;
    })
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        // res.status(badRequest).send({ message: 'Невалидный идентификатор для пользователя' });
        next(new BadRequest('Невалидный идентификатор для пользователя'));
      // }
      // else if (err.statusCode === notFound) {
      //   // res.status(notFound).send({ message: 'Такого пользователя нет' });
      //   next(new NotFound('Такого пользователя нет'));
      } else {
        // res.status(serverError).send({ message: err.message });
        // next(err);
        next(new NotFound('Такого пользователя не существует'));
      }
    });
};

// // получаем инф о текущем пользователе новый
// module.exports.getCurrentUserProfile = (req, res, next) => {
//   console.log('GHGHGHGHG');
//   const id = req.user._id;
//   User.findById(id)
//     .then((user) => {
//       res
//         .status(ok)
//         .send({ data: user });
//     })
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         next(new BadRequest('Данные введены не корректно'));
//       } else {
//         next(err);
//       }
//     });
// };

// получаем инф о текущем пользователе
module.exports.getCurrentUserProfile = (req, res, next) => {
  console.log('GHGHGHGHG');
  const { id } = req.user;

  User.findById(id)
    .orFail(() => new NotFound('Пользователь не существует'))
    .then((user) => res.send(user))
    .catch(next);
};

// дорабатываем контроллер создание пользователя
// eslint-disable-next-line arrow-body-style
module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  // если емэйл и пароль отсутствует - возвращаем ошибку
  if (!email || !password) {
    // const error = new Error('Email или пароль не переданы');// создаем объект ошибки
    // error.statusCode = badRequest; // записываем о объект ошибки поле
    // throw error; // оператор throw генерирует ошибку
    next(new BadRequest('Email или пароль не переданы'));
    // return res.status(400).send({ message: 'Email или пароль не переданы' });
  }

  bcrypt
    .hash(password, SALT_ROUNDS)
    // eslint-disable-next-line arrow-body-style
    .then((hash) => {
      return User.create({
        name,
        about,
        avatar,
        email,
        password: hash, // записываем хеш в базу,
      });
    })
    // пользователь создан
    .then((user) => res.status(created).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new Conflict('Email занят'));
        // const error = new Error('Email занят');// создаем объект ошибки
        // error.statusCode = conflict; // записываем о объект ошибки поле
        // throw error; // оператор throw генерирует ошибку
        // res.status(409).send({ message: 'Email занят' });
      }
      // throw err;
      // res.status(500).send({ message: 'Что-то пошло не так' });
    });
};

// eslint-disable-next-line arrow-body-style
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  // если емэйл и пароль отсутствует - возвращаем ошибку
  if (!email || !password) {
    // const error = new Error('Email или пароль не переданы');// создаем объект ошибки
    // error.statusCode = badRequest; // записываем о объект ошибки поле
    // throw error; // оператор throw генерирует ошибку
    next(new BadRequest('Email или пароль не переданы'));
    // return res.status(400).send({ message: 'Email или пароль не переданы' });
  }
  User
    .findOne({ email })
    .select('+password')
    .then((user) => {
      // если нет пользователя
      if (!user) {
        next(new Unauthorized('Неправильный Email или пароль'));
        // const err = new Error('Неправильный Email или пароль'); // создаем объект ошибки
        // err.statusCode = forbidden; // записываем о объект ошибки поле
        // throw err; // оператор throw генерирует ошибку
      }
      return Promise.all([
        user,
        bcrypt.compare(password, user.password), // переданный пароль и паролт из БД
      ]);
    })
    .then(([user, isPasswordCorrect]) => {
      if (!isPasswordCorrect) {
        next(new Forbidden('Неправильный Email или пароль'));
        // const err = new Error('Неправильный Email или пароль'); // создаем объект ошибки
        // err.statusCode = forbidden; // записываем о объект ошибки поле
        // throw err; // оператор throw генерирует ошибку
      }
      return generateToken({ email: user.email });
    })
    .then((token) => {
      res.send({ token });
    });
  // .catch((err) => {
  //   if (err.statusCode === 403) {
  //     return res.status(403).send({ message: err.message });
  //   }
  //   res.status(500).send({ message: 'Что-то пошло не так' });
  // });
};

// обновляем данные пользователя
module.exports.patchProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user.id, { name, about }, { new: true, runValidators: true })
    .orFail(() => new NotFound('Пользователь с таким id не найден'))
    .then((user) => {
      res
        .status(ok)
        .send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(err);
      }
    });
};

// обновляем аватар
module.exports.patchAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user.id, { avatar }, { new: true, runValidators: true })
    .orFail(() => new NotFound('Пользователь с таким id не найден'))
    .then((user) => {
      res
        .status(ok)
        .send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(new InternalServerError('Что-то пошло не так'));
      }
    });
};
