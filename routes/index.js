const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// GET / - home
router.get('/', async (req, res) => {
  try {
    const [recentes] = await db.query(
      `SELECT l.*, u.nome AS dono_nome, u.instituicao AS dono_inst
       FROM livros l JOIN usuarios u ON l.usuario_id = u.id
       WHERE l.status = 'disponivel'
       ORDER BY l.created_at DESC LIMIT 6`
    );
    const [[{ total_livros }]] = await db.query("SELECT COUNT(*) as total_livros FROM livros WHERE status = 'disponivel'");
    const [[{ total_usuarios }]] = await db.query('SELECT COUNT(*) as total_usuarios FROM usuarios');
    const [[{ total_trocas }]] = await db.query("SELECT COUNT(*) as total_trocas FROM propostas WHERE status = 'aceita'");

    res.render('home', {
      title: 'TrocaLivros — Conectando leitores universitários',
      recentes,
      stats: { total_livros, total_usuarios, total_trocas }
    });
  } catch (err) {
    console.error(err);
    res.render('home', { title: 'TrocaLivros', recentes: [], stats: { total_livros: 0, total_usuarios: 0, total_trocas: 0 } });
  }
});

// GET /dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const [meusLivros] = await db.query(
      'SELECT * FROM livros WHERE usuario_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );

    const [propostasRecebidas] = await db.query(
      `SELECT p.*, l.titulo AS livro_titulo,
              lo.titulo AS livro_oferecido_titulo,
              u.nome AS solicitante_nome, u.email AS solicitante_email,
              u.curso AS solicitante_curso
       FROM propostas p
       JOIN livros l ON p.livro_solicitado_id = l.id
       LEFT JOIN livros lo ON p.livro_oferecido_id = lo.id
       JOIN usuarios u ON p.solicitante_id = u.id
       WHERE l.usuario_id = ? AND p.status = 'pendente'
       ORDER BY p.created_at DESC`,
      [req.session.userId]
    );

    const [propostasEnviadas] = await db.query(
      `SELECT p.*, l.titulo AS livro_titulo, u.nome AS dono_nome
       FROM propostas p
       JOIN livros l ON p.livro_solicitado_id = l.id
       JOIN usuarios u ON l.usuario_id = u.id
       WHERE p.solicitante_id = ?
       ORDER BY p.created_at DESC`,
      [req.session.userId]
    );

    const [favoritos] = await db.query(
      `SELECT l.*, u.nome AS dono_nome
       FROM favoritos f
       JOIN livros l ON f.livro_id = l.id
       JOIN usuarios u ON l.usuario_id = u.id
       WHERE f.usuario_id = ?`,
      [req.session.userId]
    );

    const [usuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [req.session.userId]);

    res.render('dashboard', {
      title: 'Meu Painel',
      usuario: usuario[0],
      meusLivros,
      propostasRecebidas,
      propostasEnviadas,
      favoritos,
      query: req.query
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;