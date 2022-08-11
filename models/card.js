const mongoose = require('mongoose');

const { urlRegExp } = require('../middlewares/validation');

const userSchema = new mongoose.Schema({
  name: {
    // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // а максимальная — 30 символов
  },
  link: {
    type: String, // имя — это строка
    required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
    match: [urlRegExp, 'Введите корректный URL'],
  },
  owner: {
    type: mongoose.ObjectId,
    ref: 'user',
  },
  likes: [{
    type: mongoose.ObjectId,
    default: [],
    ref: 'user',
    required: true, // оно должно быть у каждого пользователя, так что имя — обязательное поле
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', userSchema);
