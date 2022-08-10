const { Joi, celebrate } = require('celebrate');

const urlRegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/;

const validateUser = celebrate({
  body: Joi.object().keys({
    name: Joi
      .string()
      .min(2)
      .max(30),
    about: Joi
      .string()
      .min(2)
      .max(30),
    avatar: Joi
      .string()
      .pattern(new RegExp(urlRegExp)),
    email: Joi
      .string()
      .required()
      .email(),
    password: Joi
      .string()
      .required(),
  }),
});

const validateAuthorization = celebrate({
  body: Joi.object().keys({
    email: Joi
      .string()
      .required()
      .email(),
    password: Joi
      .string()
      .required(),
  }),
});

const validateCardId = celebrate({
  params: Joi
    .object()
    .keys({
      cardId: Joi
        .string()
        .hex()
        .required(),
    }),
});

const validateCreateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(urlRegExp),
  }),
});

const validateCurrentUser = celebrate({
  params: Joi
    .object()
    .keys({
      userId: Joi
        .string()
        .hex()
        .required(),
    }),
});

const validatePatchUserProfile = celebrate({
  body: Joi
    .object()
    .keys({
      name: Joi
        .string()
        .required()
        .min(2)
        .max(30),
      about: Joi
        .string()
        .required()
        .max(30)
        .min(2),
    }),
});

const validatepatchAvatar = celebrate({
  body: {
    avatar: Joi.string().required().pattern(urlRegExp),
  },
});

module.exports = {
  validateUser,
  validateAuthorization,
  validateCardId,
  urlRegExp,
  validateCreateCard,
  validateCurrentUser,
  validatePatchUserProfile,
  validatepatchAvatar,
};
