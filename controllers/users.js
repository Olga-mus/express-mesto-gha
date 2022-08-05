// это файл контроллеров

const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const User = require('../models/user');
// const userSchema = require('../models/user');

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
module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body; // получим из объекта запроса
  // User.create({
  //   name, about, avatar, email, password,
  // });// создадим документ
  // на основе пришедших данных

  // Добавим код для хеширования в контроллер создания пользователя. За это отвечает метод hash
  bcrypt.hash(password, 10) // Метод принимает на вход два параметра:
  // пароль и длину так называемой «соли» — случайной строки,
  // которую метод добавит к паролю перед хешированем.
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash, // записываем хеш в базу
    }))
    .then((user) => res.status(created).send({ data: user })) // вернём записанные в базу данные
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(badRequest).send({ message: 'Данные введены не корректно' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};

// Создаём контроллер аутентификации

// module.exports.login = (req, res) => {
//   const { email, password } = req.body;
//   User.findOne({ email })
//     .then((user) => {
//       if (!user) {
//       // пользователь не найден — отклоняем промис
//         // с ошибкой и переходим в блок catch
//         Promise.reject(new Error('Неправильные почта или пароль'));
//       }
//       // пользователь найден
//       // сравниваем переданный пароль и хеш из базы
//       return bcrypt.compare(password, user.password);
//     })
//     .then((matched) => {
//       if (!matched) {
//         // хеши не совпали — отклоняем промис
//         Promise.reject(new Error('Неправильные почта или пароль'));
//       }

//       // аутентификация успешна
//       res.send({ message: 'Всё верно!' });
//     })
//     .catch((err) => {
//       // возвращаем ошибку аутентификации
//       res
//         .status(401)
//         .send({ message: err.message });
//     });
// };

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then(() => {
      const token = jwt.sign(
        { _id: 'd285e3dceed844f902650f40' },
        { expiresIn: '7d' },
      );
      // токен будет просрочен через неделю после создания
      // вернём токен
      res.send({ token });
    })
    .catch((err) => {
    // ошибка аутентификации
      res
        .status(401)
        .send({ message: err.message });
    });
};

// обновляем данные пользователя
module.exports.patchProfile = (req, res) => {
  const { name, about } = req.body;
  // При обновлении аватара и профиля некорректные значения ошибка валидации
  // При обновлении пользователя или карточек в options необходимо передать { new: true }
  const opts = { runValidators: true, new: true };
  User.findByIdAndUpdate(req.user._id, { name, about }, opts)
    .orFail(() => { // orFail - если БД отправляет пустой объект=>catch
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

// контроллер для получения информации о пользователе
module.exports.getUserInfo = (req, res) => {
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
