function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not Found' });
}

module.exports = { notFoundHandler };
