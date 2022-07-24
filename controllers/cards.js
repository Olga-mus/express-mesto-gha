// это файл контроллеров

const Card = require('../models/card');

const {
  created,
  badRequest,
  notFound,
  serverError,
} = require('../utils/statusResponse');

// возвращает все карточки 500
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(serverError).send({ message: err.message }));
};

// удаляет карточку по идентификатору 404
module.exports.deleteCurrentCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .orFail(() => {
      const error = new Error(); // создаём стандартную ошибку, текст ошибки

      error.statusCode = notFound; // статус кода ответа
      throw error; // Данный оператор throw генерирует ошибку
    })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(badRequest)
          .send({ message: 'Невалидный идентификатор для карточки' });
      } else if (err.statusCode === notFound) {
        res.status(notFound).send({ message: 'Такой карточки нет' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};

// создаёт карточку 400
module.exports.createCard = (req, res) => {
  console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => res.status(created).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(badRequest).send({ message: 'Ошибка валидации' });
      } else {
        res.status(serverError).send({ message: 'Что-то пошло не так' });
      }
    });
};

// ставит карточке лайк
module.exports.likeCard = (req, res) => {
  const owner = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: owner } }, { new: true })
    .orFail(() => {
      const error = new Error();

      error.statusCode = notFound;
      throw error;
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(badRequest).send({ message: 'Невалидный идентификатор карточки' });
      } else if (err.statusCode === notFound) {
        res.status(notFound).send({ message: 'Такой карточки нет' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};

// убирает у карточки лайк
module.exports.dislikeCard = (req, res) => {
  const owner = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: owner } }, { new: true })
    .orFail(() => {
      const error = new Error();

      error.statusCode = notFound;
      throw error;
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(badRequest).send({ message: 'Невалидный идентификатор карточки' });
      } else if (err.statusCode === notFound) {
        res.status(notFound).send({ message: 'Карточка не существует.' });
      } else {
        res.status(serverError).send({ message: err.message });
      }
    });
};
