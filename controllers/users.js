/* eslint-disable consistent-return */
// это файл контроллеров
const bcrypt = require('bcryptjs'); // импортируем bcrypt

const User = require('../models/user');

const SALT_ROUNDS = 10;
const { generateToken } = require('../helpers/jwt');
const BadRequest = require('../errors/error400');
const NotFound = require('../errors/error404');
const Unauthorized = require('../errors/error401');
const Conflict = require('../errors/error409');

const {
  ok,
  created,
  MONGO_DUPLICATE_ERROR_CODE,
} = require('../utils/statusResponse');

// Получаем всех пользователей 500
module.exports.getUsers = (req, res, next) => {
  User.find({}) // найти вообще всех
    .then((users) => res.send({ data: users }))
    .catch(next);
};

// Получаем текущего пользователя по id 404
module.exports.getCurrentUser = (req, res, next) => {
  const { userId } = req.params;
  console.log('userId', userId);
  User.findById(userId)
    .orFail(() => new NotFound('Нет пользователя с таким id'))
    .then((users) => res.send({ data: users }))
    .catch(next);
};

// получаем инф о текущем пользователе
module.exports.getCurrentUserProfile = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .orFail(() => new NotFound('Пользователь не существует'))
    .then((user) => res.status(ok).send({ data: user }))
    .catch(next);
};

// дорабатываем контроллер создание пользователя
// eslint-disable-next-line arrow-body-style
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // если емэйл и пароль отсутствует - возвращаем ошибку.

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
      if (err.name === 'ValidationError') {
        next(new BadRequest('Невалидные данные пользователя'));
      } else if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new Conflict('Email занят'));
      } else {
        next(err);
      }
    });
};

// логин
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        // Инструкция throw генерирует исключение и обработка кода
        // переходит в следующий блок catch(next)
        throw new Unauthorized('Не авторизован');
      } else {
        return bcrypt
          .compare(password, user.password)
          .then((isPasswordCorrect) => {
            if (!isPasswordCorrect) {
              throw new Unauthorized('Не авторизован');
            } else {
              const token = generateToken({ _id: user._id.toString() });
              res.send({ token });
            }
          }).catch(() => next(new Unauthorized('Неправильный Email или пароль')));
      }
    })
    .catch(next);
};

// обновляем данные пользователя
module.exports.patchProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(() => new NotFound('Пользователь с таким id не найден'))
    .then((user) => {
      res.status(ok).send(user);
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
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(() => new NotFound('Пользователь с таким id не найден'))
    .then((user) => {
      res.status(ok).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(err);
      }
    });
};
