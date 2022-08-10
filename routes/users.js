const router = require('express').Router(); // создали роутер

module.exports = router; // экспортировали роутер

const { validateCurrentUser, validatePatchUserProfile, validatepatchAvatar } = require('../middlewares/validation');

const {
  getUsers, getCurrentUser, patchProfile, patchAvatar, getCurrentUserProfile,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/:userId', validateCurrentUser, getCurrentUser);

router.patch('/me', validatePatchUserProfile, patchProfile);

router.patch('/me/avatar', validatepatchAvatar, patchAvatar);

router.get('/me', getCurrentUserProfile);
