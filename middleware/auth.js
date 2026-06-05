function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
}

function isGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { isAuthenticated, isGuest };
