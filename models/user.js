// import validator from 'validator';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    required: false, // имя — необязательное поле
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // а максимальная — 30 символов
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String, // имя — это строка
    required: false, // имя — необязательное поле
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // а максимальная — 30 символов
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: false, // имя — необязательное поле
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // необходимо добавить поле select
  },
});
// сделаем код проверки почты и пароля частью схемы User.
// Для этого напишем метод findUserByCredentials,
// который принимает на вход два параметра — почту и пароль —
// и возвращает объект пользователя или ошибку.
// добавим метод findUserByCredentials схеме пользователя
// у него будет два параметра — почта и пароль
// Чтобы добавить собственный метод, запишем его в свойство statics нужной схемы
// userSchema.statics.findUserByCredentials = function (email, password) {

// };

module.exports = mongoose.model('user', userSchema);
