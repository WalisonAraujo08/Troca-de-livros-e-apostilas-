const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// POST /propostas - criar proposta
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { livro_solicitado_id, livro_oferecido_id, mensagem } = req.body;

    // Não pode propor ao próprio livro
    const [[livro]] = await db.query('SELECT usuario_id FROM livros WHERE id = ?', [livro_solicitado_id]);
    if (!livro || livro.usuario_id === req.session.userId) {
      return res.redirect('/livros/' + livro_solicitado_id);
    }

    await db.query(
      `INSERT INTO propostas (livro_solicitado_id, livro_oferecido_id, solicitante_id, mensagem)
       VALUES (?, ?, ?, ?)`,
      [livro_solicitado_id, livro_oferecido_id || null, req.session.userId, mensagem || null]
    );

    res.redirect('/livros/' + livro_solicitado_id + '?proposta=enviada');
  } catch (err) {
    console.error(err);
    res.redirect('back');
  }
});

// POST /propostas/:id/aceitar
router.post('/:id/aceitar', isAuthenticated, async (req, res) => {
  try {
    const [[proposta]] = await db.query(
      `SELECT p.*, l.usuario_id AS dono_id FROM propostas p
       JOIN livros l ON p.livro_solicitado_id = l.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!proposta || proposta.dono_id !== req.session.userId) return res.redirect('/dashboard');

    await db.query("UPDATE propostas SET status = 'aceita' WHERE id = ?", [req.params.id]);
    await db.query("UPDATE livros SET status = 'concluido' WHERE id = ?", [proposta.livro_solicitado_id]);
    if (proposta.livro_oferecido_id) {
      await db.query("UPDATE livros SET status = 'concluido' WHERE id = ?", [proposta.livro_oferecido_id]);
    }
    // Recusar outras propostas do mesmo livro
    await db.query(
      "UPDATE propostas SET status = 'recusada' WHERE livro_solicitado_id = ? AND id != ?",
      [proposta.livro_solicitado_id, req.params.id]
    );
    res.redirect('/dashboard?aceita=1');
  } catch (err) {
    res.redirect('/dashboard');
  }
});

// POST /propostas/:id/recusar
router.post('/:id/recusar', isAuthenticated, async (req, res) => {
  try {
    await db.query(
      `UPDATE propostas p
       JOIN livros l ON p.livro_solicitado_id = l.id
       SET p.status = 'recusada'
       WHERE p.id = ? AND l.usuario_id = ?`,
      [req.params.id, req.session.userId]
    );
    res.redirect('/dashboard');
  } catch (err) {
    res.redirect('/dashboard');
  }
});

module.exports = router;
