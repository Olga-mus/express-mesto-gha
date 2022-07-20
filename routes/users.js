const router = require('express').Router(); // создали роутер

module.exports = router; // экспортировали роутер

const { getUsers, getCurrentUser, createUser } = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getCurrentUser);
router.post('/', createUser);
