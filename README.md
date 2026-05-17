# TechBlog - Backend

API REST do sistema de blog desenvolvida com Node.js, Express, TypeScript e MySQL.

## Como rodar

### Pré-requisitos
- Node.js 16+
- MySQL 8.0+

### Instalação

1. Clone o repositório
```bash
git clone <https://github.com/MattCrBR/BlogBack.git>
cd blog-back
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Preencha o `.env` com suas configurações:
```env
PORT=3001
JWT_SECRET=sua_chave_secreta
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senha_do_database
DB_NAME=blog_db
```

5. Importe o banco de dados
```bash
Get-Content database/dump.sql | mysql -u root -p
```

6. Rode o projeto
```bash
npm run dev
```

API disponível em `http://localhost:3001`

## Estrutura
src/
├── controllers/     # Lógica de negócio
│   ├── authController.ts
│   ├── articleController.ts
│   └── userController.ts
├── database/        # Conexão com MySQL
│   └── connection.ts
├── middleware/      # Autenticação JWT
│   └── auth.ts
├── routes/          # Rotas da API
│   ├── authRoutes.ts
│   ├── articleRoutes.ts
│   └── userRoutes.ts
└── server.ts
database/
└── dump.sql         # Estrutura do banco

## Endpoints

### Auth
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Cadastro | ❌ |
| POST | `/api/auth/login` | Login | ❌ |

### Artigos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/articles` | Listar artigos | ❌ |
| GET | `/api/articles/:id` | Detalhe do artigo | ❌ |
| POST | `/api/articles` | Criar artigo | ✅ |
| PUT | `/api/articles/:id` | Editar artigo | ✅ |
| DELETE | `/api/articles/:id` | Deletar artigo | ✅ |
| GET | `/api/articles/user/my-articles` | Meus artigos | ✅ |
| POST | `/api/articles/:id/comments` | Comentar | ✅ |
| POST | `/api/articles/:id/like` | Curtir | ✅ |
| DELETE | `/api/articles/:id/like` | Descurtir | ✅ |

### Usuário
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| PUT | `/api/users/profile` | Atualizar perfil | ✅ |

## Autenticação

As rotas protegidas precisam do token JWT no header:
Authorization: Bearer <token>

O token é obtido após o login.

## Tecnologias

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- Bcrypt