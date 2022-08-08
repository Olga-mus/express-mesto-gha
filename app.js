// app.js — входной файл
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authorization = require('./middlewares/authorization');
const pageNotFound = require('./middlewares/pageNotFound');
const { createUser, login } = require('./controllers/users');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(authorization);

app.listen(PORT);

app.use('/users', userRouter);
// запускаем, при запросе на '/users' срабатывает роутер './routes/users'
app.use('/cards', cardRouter); // запускаем, при запросе на '/cards' срабатывает роутер './routes/cards'

app.post('/signup', createUser);
app.post('/signin', login);

app.use(pageNotFound);
