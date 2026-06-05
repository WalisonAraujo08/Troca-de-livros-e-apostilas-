# 📚 TrocaLivros

> Plataforma de troca e doação de livros e apostilas para estudantes universitários.

---

## 🎯 O Problema que Resolvemos

Estudantes universitários gastam centenas de reais por semestre em livros e apostilas — muitos dos quais usam apenas uma vez. Ao mesmo tempo, pilhas de livros ficam parados nas prateleiras após a conclusão da disciplina.

O **TrocaLivros** conecta estudantes para que possam trocar ou doar materiais acadêmicos gratuitamente, reduzindo o custo da educação e evitando o desperdício.

---

## ✨ Funcionalidades

- 🔐 **Autenticação completa** — cadastro, login e sessão segura
- 📚 **Anunciar livros/apostilas** — com foto, condição, categoria e modalidade (troca ou doação)
- 🔍 **Busca e filtros** — por título, autor, categoria, condição e modalidade
- 🤝 **Sistema de propostas** — enviar, aceitar e recusar propostas de troca
- ♡ **Favoritos** — salve livros que deseja acompanhar
- 📊 **Painel do usuário** — gerencie seus anúncios, propostas e favoritos
- 📱 **Design responsivo** — funciona perfeitamente no celular

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5 semântico, CSS3 (mobile-first), JavaScript ES6+ |
| Back-end | Node.js 18+, Express 4 |
| Template engine | EJS |
| Banco de dados | MySQL 8 + mysql2 |
| Autenticação | express-session + bcryptjs (custo 10) |
| Segurança | helmet, express-rate-limit, express-validator |
| Upload | multer |
| Deploy | Render (app) + Railway (MySQL) |

---

## 🗄️ Estrutura do Banco de Dados

```
usuarios        — id, nome, email, senha (hash), curso, instituicao
livros          — id, titulo, autor, categoria, condicao, modalidade, capa, status, usuario_id
propostas       — id, livro_solicitado_id, livro_oferecido_id, solicitante_id, mensagem, status
favoritos       — id, usuario_id, livro_id
```

As tabelas possuem FOREIGN KEYS e a query de listagem usa **JOIN** entre `livros` e `usuarios`.

---

## 📁 Estrutura do Projeto

```
trocalivros/
├── config/
│   ├── db.js           # Pool de conexão MySQL
│   └── migrate.js      # Script de criação das tabelas
├── middleware/
│   └── auth.js         # isAuthenticated, isGuest
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── uploads/        # Imagens enviadas (não versionado)
├── routes/
│   ├── index.js        # GET /, GET /dashboard
│   ├── auth.js         # GET/POST /auth/login, /registro, /logout
│   ├── livros.js       # GET/POST /livros, /livros/:id, etc.
│   └── propostas.js    # POST /propostas, /aceitar, /recusar
├── views/
│   ├── partials/       # header.ejs, footer.ejs
│   ├── auth/           # login.ejs, registro.ejs
│   ├── livros/         # index.ejs, detalhe.ejs, form.ejs
│   ├── home.ejs
│   ├── dashboard.ejs
│   └── 404.ejs
├── server.js
├── package.json
├── .env.example
└── .gitignore
```

---

## 🚀 Executar Localmente

### Pré-requisitos
- Node.js 18+
- MySQL 8+

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/trocalivros.git
cd trocalivros

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite o .env com suas credenciais MySQL

# 4. Crie as tabelas no banco
npm run db:migrate

# 5. Inicie o servidor
npm run dev        # desenvolvimento (nodemon)
# ou
npm start          # produção
```

Acesse: **http://localhost:3000**

---

## ☁️ Deploy

### Banco de dados — Railway
1. Crie uma conta em [railway.app](https://railway.app)
2. Novo projeto → Add MySQL
3. Copie as credenciais para as variáveis de ambiente

### Aplicação — Render
1. Crie uma conta em [render.com](https://render.com)
2. New Web Service → conecte seu GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. Adicione as variáveis de ambiente (`DB_HOST`, `DB_USER`, etc.)
6. Após o deploy, acesse o console e rode: `npm run db:migrate`

---

## 🔒 Segurança implementada

- Senhas com hash **bcryptjs** (custo 10)
- **helmet()** — cabeçalhos HTTP seguros
- **express-rate-limit** — limite de 200 req/15min geral; 20 req/15min em `/auth`
- **express-validator** — validação server-side em todas as rotas de escrita
- **mysql2 com placeholders `?`** — proteção contra SQL Injection
- Variáveis sensíveis em `.env` (não versionado)

---

## 👥 Equipe

| Nome | Responsabilidade |
|---|---|
| **Walison Araujo Santana** | Back-end (rotas, autenticação, banco de dados) |
| **Bruno Ferrer** | Front-end (HTML, CSS, design responsivo) |
| **Cauã Tomas** | Integração, deploy e documentação |

---

## 📄 Licença

MIT — Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento de Software para Web — FMU 2026/1**.
