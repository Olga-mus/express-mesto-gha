// это файл контроллеров

const Card = require('../models/card');

const BadRequest = require('../errors/error400');
const Forbidden = require('../errors/error403');
const NotFound = require('../errors/error404');
const InternalServerError = require('../errors/error500');

const {
  ok,
} = require('../utils/statusResponse');

// возвращает все карточки 500
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

// удаляем карточку
module.exports.deleteCurrentCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        next(new NotFound('Карточка с таким id не найдена'));
        return;
      }
      if (card.owner.toString() !== req.user.id.toString()) {
        next(new Forbidden('Нельзя удалить эту карточку'));
        return;
      }
      card.remove()
        .then(() => {
          res.status(ok).send({ message: 'Карточка успешно удалена' });
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(new InternalServerError('Что-то пошло не так'));
      }
    });
};

// создаем карточку
module.exports.createCard = (req, res, next) => {
  const {
    name,
    link,
    likes,
  } = req.body;
  const owner = req.user.id;
  Card.create({
    name,
    link,
    owner,
    likes,
  })
    .then((card) => {
      res
        .status(201)
        .send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(new InternalServerError('Что-то пошло не так'));
      }
    });
};

// ставит карточке лайк
module.exports.likeCard = (req, res, next) => {
  const owner = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: owner } }, { new: true })
    .orFail(() => new NotFound('Карточка не существует'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Невалидный идентификатор карточки.'));
      } else {
        next(err);
      }
    });
};

// убирает у карточки лайк
module.exports.dislikeCard = (req, res, next) => {
  const owner = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: owner } }, { new: true })
    .orFail(() => new NotFound('Карточка не существует.'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Невалидный идентификатор карточки'));
      } else {
        next(err);
      }
    });
};
