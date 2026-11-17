# StockMarket Manager

Sistema web de gerenciamento de estoque para supermercado. Esta é a primeira versão funcional (MVP) do projeto de portfólio.

## Funcionalidades implementadas
- Dashboard com indicadores de produtos, unidades, estoque baixo e valor de custo estimado.
- Cadastro, consulta, pesquisa, edição e exclusão de produtos.
- Registro de entradas e saídas.
- Validação para impedir saída maior que o estoque disponível.
- Histórico recente de movimentações.
- API REST com Node.js e Express.
- Persistência com MySQL.

## Tecnologias
HTML5, CSS3, JavaScript, Node.js, Express e MySQL.

## Requisitos
- Node.js 18 ou superior
- MySQL 8 ou compatível
- Git

## Instalação
1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/SEU-USUARIO/stockmarket-manager.git
   cd stockmarket-manager
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute `database/schema.sql` no MySQL Workbench ou no terminal MySQL.
4. Copie `.env.example` para `.env` e informe suas configurações locais:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=stockmarket_manager
   ```
5. Inicie:
   ```bash
   npm run dev
   ```
6. Abra `http://localhost:3000`.

## Estrutura
```text
stockmarket-manager/
├── backend/
│   ├── config/database.js
│   ├── controllers/productsController.js
│   ├── routes/productsRoutes.js
│   └── server.js
├── database/schema.sql
├── frontend/
│   ├── css/styles.css
│   ├── js/app.js
│   └── index.html
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API
| Método | Endpoint | Função |
|---|---|---|
| GET | `/api/dashboard` | Indicadores e movimentações recentes |
| GET | `/api/products` | Listar/pesquisar produtos |
| GET | `/api/products/:id` | Consultar produto |
| POST | `/api/products` | Cadastrar produto |
| PUT | `/api/products/:id` | Atualizar produto |
| DELETE | `/api/products/:id` | Excluir produto sem histórico |
| POST | `/api/products/:id/movements` | Registrar entrada ou saída |

## Próximas etapas
- Login e permissões de administrador/funcionário.
- Categorias e fornecedores.
- Relatórios e exportação CSV.
- Envio de e-mails.
- Área de suporte com chamados.
- Lotes e validade dos produtos.
- Testes automatizados e auditoria.

## Aviso
Projeto em desenvolvimento para estudo e portfólio. Não utilizar em produção sem implementar autenticação, autorização, testes, auditoria e revisão de segurança.
