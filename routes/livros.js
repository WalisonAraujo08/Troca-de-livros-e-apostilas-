const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  }
});

// GET /livros - listar com filtros
router.get('/', async (req, res) => {
  try {
    const { busca, categoria, condicao, modalidade, page = 1 } = req.query;
    const limit = 12;
    const offset = (page - 1) * limit;
    let where = ["l.status = 'disponivel'"];
    const params = [];

    if (busca) {
      where.push('(l.titulo LIKE ? OR l.autor LIKE ?)');
      params.push(`%${busca}%`, `%${busca}%`);
    }
    if (categoria) { where.push('l.categoria = ?'); params.push(categoria); }
    if (condicao) { where.push('l.condicao = ?'); params.push(condicao); }
    if (modalidade) { where.push('l.modalidade = ?'); params.push(modalidade); }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [livros] = await db.query(
      `SELECT l.*, u.nome AS dono_nome, u.instituicao AS dono_inst
       FROM livros l
       JOIN usuarios u ON l.usuario_id = u.id
       ${whereStr}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM livros l JOIN usuarios u ON l.usuario_id = u.id ${whereStr}`,
      params
    );

    res.render('livros/index', {
      title: 'Explorar Livros',
      livros,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      query: req.query
    });
  } catch (err) {
    console.error(err);
    res.render('livros/index', { title: 'Explorar', livros: [], total: 0, page: 1, pages: 1, query: {} });
  }
});

// GET /livros/novo
router.get('/novo', isAuthenticated, (req, res) => {
  res.render('livros/form', { title: 'Anunciar Livro', livro: null, errors: [] });
});

// POST /livros/novo
router.post('/novo', isAuthenticated, upload.single('capa'), [
  body('titulo').trim().notEmpty().withMessage('Título obrigatório'),
  body('condicao').notEmpty().withMessage('Informe a condição'),
  body('modalidade').notEmpty().withMessage('Informe a modalidade')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('livros/form', { title: 'Anunciar Livro', livro: req.body, errors: errors.array() });
  }

  try {
    const capa = req.file ? '/uploads/' + req.file.filename : null;
    await db.query(
      `INSERT INTO livros (titulo, autor, descricao, categoria, condicao, capa, modalidade, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.body.titulo, req.body.autor, req.body.descricao,
       req.body.categoria || 'livro', req.body.condicao,
       capa, req.body.modalidade, req.session.userId]
    );
    res.redirect('/livros?success=1');
  } catch (err) {
    console.error(err);
    res.render('livros/form', { title: 'Anunciar Livro', livro: req.body, errors: [{ msg: 'Erro ao cadastrar' }] });
  }
});

// GET /livros/:id
router.get('/:id', async (req, res) => {
  try {
    const [[livro]] = await db.query(
      `SELECT l.*, u.nome AS dono_nome, u.email AS dono_email,
              u.curso AS dono_curso, u.instituicao AS dono_inst
       FROM livros l
       JOIN usuarios u ON l.usuario_id = u.id
       WHERE l.id = ?`,
      [req.params.id]
    );
    if (!livro) return res.redirect('/livros');

    let meuLivros = [];
    let jaPropôs = false;
    if (req.session.userId) {
      const [rows] = await db.query(
        "SELECT * FROM livros WHERE usuario_id = ? AND status = 'disponivel'",
        [req.session.userId]
      );
      meuLivros = rows.filter(l => l.id !== livro.id);

      const [prop] = await db.query(
        "SELECT id FROM propostas WHERE livro_solicitado_id = ? AND solicitante_id = ? AND status = 'pendente'",
        [livro.id, req.session.userId]
      );
      jaPropôs = prop.length > 0;
    }

res.render('livros/detalhe', { title: livro.titulo, livro, meuLivros, jaPropôs, query: req.query });
  } catch (err) {
    console.error(err);
    res.redirect('/livros');
  }
});

// POST /livros/:id/favoritar
router.post('/:id/favoritar', isAuthenticated, async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM favoritos WHERE usuario_id = ? AND livro_id = ?',
      [req.session.userId, req.params.id]
    );
    if (existing.length) {
      await db.query('DELETE FROM favoritos WHERE usuario_id = ? AND livro_id = ?',
        [req.session.userId, req.params.id]);
    } else {
      await db.query('INSERT INTO favoritos (usuario_id, livro_id) VALUES (?, ?)',
        [req.session.userId, req.params.id]);
    }
    res.redirect('back');
  } catch (err) {
    res.redirect('back');
  }
});

// POST /livros/:id/deletar
router.post('/:id/deletar', isAuthenticated, async (req, res) => {
  try {
    await db.query('DELETE FROM livros WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.session.userId]);
    res.redirect('/dashboard');
  } catch (err) {
    res.redirect('/dashboard');
  }
});

module.exports = router;
