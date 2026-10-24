# Plano prático de validação e evidências

## 1. Preparação

- Instalar Node.js 22 e Docker Engine/Compose. Abrir a pasta raiz do projeto.
- Copiar `.env.example` para `.env`, ajustar credenciais fortes e `JWT_SECRET` (mínimo 32 caracteres). Para Compose, incluir `MYSQL_ROOT_PASSWORD`.
- Instalar dependências (`npm install`) e **gerar/commitar `package-lock.json`**. O ZIP não inclui lockfile porque este ambiente não conseguiu instalar dependências npm.

## 2. Banco e API local

```bash
docker compose up --build -d
docker compose ps
curl -i http://localhost:3000/health
curl -i http://localhost:3000/openapi.json
```

O compose importa schema e seed **somente quando cria um volume vazio**. Se mudar scripts depois, aplique migrations, não apague dados reais. Não rode `docker compose down -v` em volumes com dados importantes.

## 3. Testes

```bash
npm run check
npm run integrity
npm test
npm run test:coverage
# abrir coverage/index.html
npm run test:tdd:red       # falhas didáticas esperadas
npm run test:tdd:green
npm run test:tdd:refactor
```

O laboratório Red é intencionalmente falho. Não confundir com falhas dos testes reais.

## 4. MySQL isolado para Jest real

O arquivo `compose.integration.yaml` cria **outro volume** e publica MySQL em `127.0.0.1:3308`.

```bash
# defina TEST_MYSQL_ROOT_PASSWORD e TEST_DB_PASSWORD no seu .env (local, não versionado)
docker compose -f compose.integration.yaml up -d
# exporte variáveis para o processo Node (PowerShell: $env:NOME='valor')
export NODE_ENV=test RUN_DB_TESTS=1 DB_HOST=127.0.0.1 DB_PORT=3308 DB_NAME=hospedja DB_USER=hospedja_teste
export DB_PASSWORD='SENHA_DO_BANCO_DE_TESTE' JWT_SECRET='SEGREDO_TESTE_COM_PELO_MENOS_32_CARACTERES'
npm run test:db
```

O teste de integração cria dados temporários e limpa ao final. **Não apontar para um banco de produção.**

## 5. Checklist de smoke tests HTTP

- [ ] `/health` responde 200 e consulta o banco.
- [ ] Swagger UI: `http://localhost:3000/api-docs/` carrega.
- [ ] POST `/api/v1/auth/register` retorna 201 sem senha nem hash no corpo.
- [ ] POST `/api/v1/auth/login` retorna token; erro de senha gera 401.
- [ ] Sem JWT, GET `/api/v1/usuarios/me` retorna 401.
- [ ] Cliente tentando rota administrativa recebe 403.
- [ ] Cliente não acessa reserva de outro usuário.
- [ ] Hotel, quarto e guia criam/consultam/atualizam conforme perfil.
- [ ] Reserva PENDENTE criada; não deve ser apresentada como CONFIRMADA.
- [ ] Exclusão de rascunho sem pagamento e recusa de cancelamento com pagamento.
- [ ] Tabela `tb_log` registra ação, data/hora, usuário, IP, resultado; nenhum segredo.
- [ ] Revisão de ocorrência exige ADMIN; não aplica penalidade automaticamente.

## 6. Evidências para PDF / professor

Nome sugerido `evidencias/YYYY-MM-DD_<tipo>.png` com dados ocultos: `docker-compose-ps`, `mysql-verificacao`, `jest-coverage`, `swagger`, `auth-401`, `auditoria-sanitizada`, `github-commits`, `aws-https`, `rds-privado`.

Não registrar secrets em capturas, não montar evidência fictícia, não mostrar `.env`.
