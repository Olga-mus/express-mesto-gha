/* eslint-disable consistent-return */
// это файл контроллеров

// eslint-disable-next-line import/no-unresolved
// const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const User = require('../models/user');
// const userSchema = require('../models/user');
const SALT_ROUNDS = 10;
// const JWT_SECRET = 'some-secret-key';
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

// // создает пользователя
// module.exports.createUser = (req, res) => {
//   const {
//     name, about, avatar, email, password,
//   } = req.body; // получим из объекта запроса
//   // User.create({
//   //   name, about, avatar, email, password,
//   // });// создадим документ
//   // на основе пришедших данных

//   // Добавим код для хеширования в контроллер создания пользователя. За это отвечает метод hash
//   bcrypt.hash(password, SALT_ROUNDS) // Метод принимает на вход два параметра:
//   // пароль и длину так называемой «соли» — случайной строки,
//   // которую метод добавит к паролю перед хешированем.
//     .then((hash) => User.create({
//       name,
//       about,
//       avatar,
//       email,
//       password: hash, // записываем хеш в базу
//     }))
//     .then((user) => res.status(created).send({ data: user })) // вернём записанные в базу данные
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         res.status(badRequest).send({ message: 'Данные введены не корректно' });
//       } else {
//         res.status(serverError).send({ message: err.message });
//       }
//     });
// };

// переписываем createUser работает по вебинару
// регистрация
// eslint-disable-next-line consistent-return

// регистрация вебинар 40 поток
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

  // если передан емэйл, который уже есть в БД - его зарегать не можем
  // ищем в базе, существует ли пользователь с таким емэйлом или нет
  // если переданного емэйла нет в БД - будет что-то делать с регистацией
  // если переданный емэйл уже есть в БД  - возвращаем ошибку
  User.findOne({ email });
  return bcrypt.hash(password, SALT_ROUNDS) // Метод принимает на вход два параметра:
    .then((hash) => {
      // создаем пользователя
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash, // записываем хеш в базу,
      })
      // создаем пользователя
      // вернём записанные в базу данные
        .then((userData) => res.status(created).send({ data: userData }));
      // пользователь не создан
    })
    // если переданный емэйл уже есть в БД  - возвращаем ошибку
    .catch(() => {
      res.status(500).send({ message: 'Internal Error' });
    });
};

// // вебинар по Наталье
// module.exports.createUser = (req, res) => {
//   const {
//     name,
//     about,
//     avatar,
//     email,
//     password,
//   } = req.body;
//   if (!email || !password) {
//     return res.status(400).send({ message: 'Email или пароль не переданы' });
//   }

//   User.create({
//     name,
//     about,
//     avatar,
//     email,
//     password,
//   })
//     .then(() => {
//       res.send({ message: 'Пользователь создан' });
//     })
//     .catch((err) => {
//       console.log('YUYUYUYUYUYU');
//       console.log(err);
//       return res.status(500).res.send({ message: 'Что-то пошло не так' });
//     });
// };

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

// // это мой вариант логина
// module.exports.login = (req, res) => {
//   const { email, password } = req.body;
//   return User.findUserByCredentials(email, password)
//     .then(() => {
//       const token = jwt.sign(
//         { _id: 'd285e3dceed844f902650f40' },
//         JWT_SECRET,
//         { expiresIn: '7d' },
//       );
//       // токен будет просрочен через неделю после создания
//       // вернём токен
//       res.send({ token });
//     })
//     .catch((err) => {
//     // ошибка аутентификации
//       res
//         .status(401)
//         .send({ message: err.message });
//     });
// };

// переписываем логин
// аунтефикация
module.exports.login = (req, res) => {
  const { email, password } = req.body;
  // если емэйл и пароль отсутствует - возвращаем ошибку
  if (!email || !password) {
    return res.status(400).send({ message: 'Email или пароль не переданы' });
  }
  // ищем пользовтеля по емэйлу
  User.findOne({ email }).select('+password')
    .then((user) => {
    // если пользователь не найден - возвращаем статус
      if (!user) {
        return res.status(403).send({ message: 'Такого пользователя не существует' });
      }
      // сравниваем пароль
      // password-нам пришел, user.password-в БД в виде хэша
      bcrypt.compare(password, user.password, (err, isValidPassword) => {
        console.log(user);
        // если пароль невалидный
        if (!isValidPassword) {
          return res.status(401).send({ message: 'Пароль неверный' });
        }
        return res.status(200).send({ user: user.email });
      });
    })
    .catch(() => {
      res.status(500).send({ message: 'Internal Error' });
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
