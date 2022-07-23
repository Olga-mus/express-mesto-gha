const authorization = (req, res, next) => {
  req.user = {
    _id: '62d744220486606bbec7cdb8',
  };

  next();
};

module.exports = authorization;
