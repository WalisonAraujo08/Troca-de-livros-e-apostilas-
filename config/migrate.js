require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('🔌 Conectado ao MySQL...');

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'trocalivros'}\`;`);
  await connection.query(`USE \`${process.env.DB_NAME || 'trocalivros'}\`;`);

  const sql = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      curso VARCHAR(100),
      instituicao VARCHAR(150),
      avatar VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS livros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(200) NOT NULL,
      autor VARCHAR(150),
      descricao TEXT,
      categoria ENUM('livro','apostila','revista','outro') DEFAULT 'livro',
      condicao ENUM('novo','otimo','bom','regular') NOT NULL,
      capa VARCHAR(255),
      modalidade ENUM('troca','doacao') DEFAULT 'troca',
      status ENUM('disponivel','reservado','concluido') DEFAULT 'disponivel',
      usuario_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS propostas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      livro_solicitado_id INT NOT NULL,
      livro_oferecido_id INT,
      solicitante_id INT NOT NULL,
      mensagem TEXT,
      status ENUM('pendente','aceita','recusada','cancelada') DEFAULT 'pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (livro_solicitado_id) REFERENCES livros(id) ON DELETE CASCADE,
      FOREIGN KEY (livro_oferecido_id) REFERENCES livros(id) ON DELETE SET NULL,
      FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      livro_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_fav (usuario_id, livro_id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE
    );
  `;

  await connection.query(sql);
  console.log('✅ Tabelas criadas com sucesso!');
  console.log('   - usuarios');
  console.log('   - livros');
  console.log('   - propostas');
  console.log('   - favoritos');

  await connection.end();
  console.log('🎉 Migração concluída!');
}

migrate().catch(err => {
  console.error('❌ Erro na migração:', err.message);
  process.exit(1);
});
