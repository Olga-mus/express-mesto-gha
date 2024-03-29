// app.js — входной файл
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const pageNotFound = require('./middlewares/pageNotFound');
const { createUser, login } = require('./controllers/users');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { isAuthorized } = require('./middlewares/isAuthorized');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { validateUser, validateAuthorization } = require('./middlewares/validation');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(requestLogger); // подключаем логгер запросов

// app.use('/users', isAuthorized, userRouter);
app.use('/users', isAuthorized, userRouter);
// запускаем, при запросе на '/users' срабатывает роутер './routes/users'
app.use('/cards', isAuthorized, cardRouter); // запускаем, при запросе на '/cards' срабатывает роутер './routes/cards'

// app.post('/signup', createUser);
app.post('/signup', validateUser, createUser);

// app.post('/signin', login);

app.post('/signin', validateAuthorization, login);

app.use(pageNotFound);

app.use(errorLogger); // подключаем логгер ошибок

// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate

// централизованный обрабочик ошибок
// eslint-disable-next-line consistent-return
app.use((err, req, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }
  res.status(500).send({ message: 'Что-то пошло не так' });
  next();
});

app.listen(PORT);
