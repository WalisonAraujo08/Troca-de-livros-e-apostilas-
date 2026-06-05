require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Muitas requisições. Tente novamente em alguns minutos.'
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});
app.use('/auth', authLimiter);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_trocalivros',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
}));

// Locals globais para as views
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.userName = req.session.userName || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/livros', require('./routes/livros'));
app.use('/propostas', require('./routes/propostas'));

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('404', { title: 'Erro interno' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TrocaLivros rodando em http://localhost:${PORT}`);
});
