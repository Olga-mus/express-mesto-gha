const router = require('express').Router(); // создали роутер

module.exports = router; // экспортировали роутер

const { validateCardId, validateCreateCard } = require('../middlewares/validation');

const {
  getCards, deleteCurrentCard, createCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

// router.delete('/:cardId', deleteCurrentCard);
router.delete('/:cardId', validateCardId, deleteCurrentCard);

// router.post('/', createCard);

router.post('/', validateCreateCard, createCard);

// router.put('/:cardId/likes', likeCard);
router.put('/:cardId/likes', validateCardId, likeCard);

// router.delete('/:cardId/likes', dislikeCard);
router.delete('/:cardId/likes', validateCardId, dislikeCard);
