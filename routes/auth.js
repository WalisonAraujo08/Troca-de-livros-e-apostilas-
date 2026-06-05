const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { isGuest } = require('../middleware/auth');

// GET /auth/login
router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', { title: 'Entrar', errors: [], old: {} });
});

// POST /auth/login
router.post('/login', isGuest, [
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('senha').notEmpty().withMessage('Senha obrigatória')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      title: 'Entrar',
      errors: errors.array(),
      old: req.body
    });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [req.body.email]);
    if (!rows.length) {
      return res.render('auth/login', {
        title: 'Entrar',
        errors: [{ msg: 'E-mail ou senha incorretos' }],
        old: req.body
      });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(req.body.senha, usuario.senha);
    if (!match) {
      return res.render('auth/login', {
        title: 'Entrar',
        errors: [{ msg: 'E-mail ou senha incorretos' }],
        old: req.body
      });
    }

    req.session.userId = usuario.id;
    req.session.userName = usuario.nome;
    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'Entrar',
      errors: [{ msg: 'Erro interno. Tente novamente.' }],
      old: req.body
    });
  }
});

// GET /auth/registro
router.get('/registro', isGuest, (req, res) => {
  res.render('auth/registro', { title: 'Criar Conta', errors: [], old: {} });
});

// POST /auth/registro
router.post('/registro', isGuest, [
  body('nome').trim().isLength({ min: 3 }).withMessage('Nome deve ter ao menos 3 caracteres'),
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
  body('confirmar_senha').custom((val, { req }) => {
    if (val !== req.body.senha) throw new Error('As senhas não coincidem');
    return true;
  }),
  body('curso').trim().notEmpty().withMessage('Informe seu curso'),
  body('instituicao').trim().notEmpty().withMessage('Informe sua instituição')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/registro', {
      title: 'Criar Conta',
      errors: errors.array(),
      old: req.body
    });
  }

  try {
    const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [req.body.email]);
    if (existing.length) {
      return res.render('auth/registro', {
        title: 'Criar Conta',
        errors: [{ msg: 'Este e-mail já está cadastrado' }],
        old: req.body
      });
    }

    const hash = await bcrypt.hash(req.body.senha, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, curso, instituicao) VALUES (?, ?, ?, ?, ?)',
      [req.body.nome, req.body.email, hash, req.body.curso, req.body.instituicao]
    );

    req.session.userId = result.insertId;
    req.session.userName = req.body.nome;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/registro', {
      title: 'Criar Conta',
      errors: [{ msg: 'Erro ao criar conta. Tente novamente.' }],
      old: req.body
    });
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
