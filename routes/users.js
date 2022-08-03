const router = require('express').Router(); // создали роутер

module.exports = router; // экспортировали роутер

const {
  getUsers, getCurrentUser, patchProfile, patchAvatar, getUserInfo,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getCurrentUser);
router.patch('/me', patchProfile);
router.patch('/me/avatar', patchAvatar);
router.get('/me', getUserInfo);
