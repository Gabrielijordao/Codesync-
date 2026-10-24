# Histórico original da Parte 2

> Documento preservado para rastreabilidade. O README da raiz e a auditoria técnica da Parte 4 prevalecem.

# HospedJá — Checkpoint 3 — Parte 2: API REST + Docker

**Equipe CodeSync — Grupo 3 | UNIUBE | Projeto de Software 2**

API Node.js/Express e persistência MySQL **compatíveis com o banco entregue na Parte 1**. Os scripts `database/01_schema.sql` e `database/02_seed.sql` estão copiados aqui, para este pacote funcionar isoladamente. O `02_seed.sql` é **exclusivo para desenvolvimento**: cria contas, inclusive administrador, com senhas conhecidas.

## 1. Requisitos

- Docker Desktop (Windows com WSL2) ou Docker Engine com plugin Compose.
- Alternativamente: Node.js 20+ (preferencialmente 22), npm e MySQL 8.
- Portas locais livres: `3000` (API) e `3307` (MySQL no host).
- Conexão à internet disponível na PRIMEIRA execução para baixar as imagens e os pacotes npm.

## 2. Executar localmente com Docker Compose (recomendado)

```bash
cp .env.example .env
# Edite .env: substitua DB_PASSWORD e JWT_SECRET por valores fortes.
# Acrescente esta variável ao arquivo .env com uma senha forte:
# MYSQL_ROOT_PASSWORD=outra_senha_forte_diferente
# Gere JWT_SECRET por: openssl rand -hex 32
docker compose up --build -d
docker compose ps
curl -i http://localhost:3000/health
```

**Importante:** a execução do schema e seed em `/docker-entrypoint-initdb.d` ocorre **apenas na primeira inicialização de um volume vazio**. O MySQL fica acessível externamente apenas em `127.0.0.1:3307`. A API acessa `db:3306` pela rede interna do Docker. A variável `DB_PORT=3306` no `.env` vale para executar a API diretamente no servidor MySQL convencional, não para acessar a porta mapeada do Docker no host.

Para inspecionar os logs:

```bash
docker compose logs -f api
# Execute no mesmo diretorio, sem expor a senha no terminal:
docker compose exec db sh -lc 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root -e "SELECT id_log,id_usuario,acao,resultado,ip,data_hora FROM hospedja.tb_log ORDER BY id_log DESC LIMIT 10;"'
```

A tabela `tb_log` contém eventos assíncronos; consulte-a após um login ou um POST.

Para reiniciar mantendo dados: `docker compose down`. Para apagar **todos os dados de desenvolvimento** e reinicializar: `docker compose down -v` (irreversível).

## 3. Executar diretamente com Node

```bash
npm install
cp .env.example .env
# Preencha o .env com credenciais fortes e acesso ao seu MySQL 8.
# Rode 01_schema.sql e 02_seed.sql no banco APENAS de teste.
npm run check
npm run integrity
npm run dev
```

Se estiver com o MySQL do Compose exposto em `localhost:3307` e o Node fora do container, utilize `DB_HOST=127.0.0.1` e `DB_PORT=3307`.

## 4. Verificar API

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"cliente@hospedja.example","senha":"Cliente#CP3_2026!"}'

curl http://localhost:3000/api/v1/hoteis
```

Use o `token` retornado pelo login como `Authorization: Bearer <token>`. Exemplo de cadastro:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Aluno Teste","email":"aluno.teste@example.com","senha":"SenhaNova#2026!"}'
```

Os exemplos completos para a extensão REST Client do VS Code estão em `examples/requisicoes.http`.

**Senhas somente locais (seed da Parte 1):** `cliente@hospedja.example` / `Cliente#CP3_2026!`; `admin@hospedja.example` / `Admin#CP3_2026!`; `gestor@hospedja.example` / `Gestor#CP3_2026!`. Nunca use essas contas em produção. Autenticação normal aceita apenas usuários ativos.

## 5. Estrutura e responsabilidades

```text
src/
  app.js                       middlewares, CORS, routes, erros
  server.js                    conexao inicial e listen
  config/{env,database}.js     variaveis de ambiente, mysql2/promise
  routes/                      definicao dos endpoints
  controllers/                 request/response HTTP
  services/                    casos de uso e verificacoes de acesso
  repositories/                SQL parametrizado
  middlewares/                 JWT, validacao, erro, auditoria
  validators/                  Zod e schemas strict
  utils/                       hash bcrypt, JWT, logger
scripts/check-project.js       verificacao sintatica sem dependencias
```

`app.js` não executa `listen`, permitindo ser importado pelo Supertest na **Parte 3 (TDD)**. Não há integração ativa com Mercado Pago, DeepSeek ou aplicativo mobile. A API já usa JSON, JWT e CORS configurável para clientes futuros.

## 6. Limites importantes desta etapa

- **Reservas:** `POST /reservas` cria apenas registro preliminar `PENDENTE`, com valores provisórios zero; **não reserva vagas nem confirma preços**. Não use para venda real. DELETE cancela SOMENTE rascunhos pendentes sem pagamentos; cancelamentos confirmados e estornos não são processados.
- **Pagamentos:** leitura e criação de registros preliminares **somente por administrador**; a API **não aprova, estorna, cobra ou integra Mercado Pago**. `PATCH/DELETE /pagamentos` não existem, preservando histórico financeiro.
- **Ocorrências:** clientes podem registrar; a análise é de administrador, com identidade e data da decisão. Nenhuma penalidade é aplicada automaticamente e não existe endpoint de punição nesta etapa.
- **Catálogo:** DELETE realiza **desativação lógica**, preservando referências.
- **Segurança:** hash bcrypt, tokens JWT com expiração, perfil validado no MySQL por requisição, limitação de tentativas de autenticação, SQL parametrizado, validação Zod, CORS por origem, Helmet, logs sem senhas/tokens. Isso não equivale a certificação para produção.
- **Auditoria:** sucesso/negação/falha de requisições de escrita são enviados à tabela `tb_log` e ao Winston em stdout. A escrita da auditoria ocorre após a resposta e é **best effort** (falha de auditoria é sinalizada no logger, mas não desfaz a operação). Transações de reserva gravam também `tb_reserva_status`; pagamentos preliminares gravam `tb_pagamento_status`.
- **Paginação:** endpoints de listagem limitam a 100 registros nesta versão acadêmica. A paginação e buscas serão refinadas.
- **Status de produção:** não publicar diretamente na internet sem HTTPS, gestão de segredos, backups, monitoramento, testes e revisão das regras de reserva/pagamento.

## 7. Verificações e limitação do ambiente de autoria

A sintaxe de **37 arquivos JavaScript** foi validada localmente com `npm run check`. Não houve execução end-to-end porque, neste ambiente, não foi possível alcançar o npm para instalar dependências, nem iniciar um container MySQL ou Docker. **Não se considera a API validada funcionalmente** até executar `docker compose up --build`, o health check, login e as rotas principais no computador da equipe.

**TDD com Jest/Supertest, OpenAPI/Swagger, cobertura e deploy AWS** serão entregues na Parte 3. Para a disciplina, a equipe precisará demonstrar os testes TDD e commits associados, não alegar retroativamente que a implementação desta parte foi precedida por testes.

Veja `docs/ROTAS_E_PERMISSOES.md` para todos os endpoints, exemplos de payloads, regras de acesso e decisões ligadas aos RFs.
