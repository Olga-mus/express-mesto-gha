// app.js — входной файл
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authorization = require('./middlewares/authorization');
const pageNotFound = require('./middlewares/pageNotFound');
const { login } = require('./controllers/users');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(authorization);

app.listen(PORT);

app.use('/users', require('./routes/users')); // запускаем, при запросе на '/users' срабатывает роутер './routes/users'
app.use('/cards', require('./routes/cards')); // запускаем, при запросе на '/cards' срабатывает роутер './routes/cards'

app.post('/signin', login);

app.use(pageNotFound);
