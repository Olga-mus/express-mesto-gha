const pageNotFound = (req, res) => {
  res.status(404).send({ message: 'Page not found' });
};

module.exports = pageNotFound;
