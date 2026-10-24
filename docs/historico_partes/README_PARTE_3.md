# Histórico original da Parte 3

> Documento preservado para rastreabilidade. O README da raiz e a auditoria técnica da Parte 4 prevalecem.

# HospedJá — CodeSync — Checkpoint 3 — Parte 3

**Pacote cumulativo e autônomo:** inclui a base da Parte 2 (API + MySQL + Docker), adiciona **Jest/Supertest, cobertura, Swagger/OpenAPI, laboratório TDD e guia AWS**. Equipe CodeSync, Grupo 3, UNIUBE.

## Conteúdo e links internos

- `tests/unit/` — bcrypt/JWT, cadastro, login, troca de senha e auditoria (Jest).
- `tests/http/` — Supertest exercitando Express + validação + middleware, repositórios simulados.
- `tests/db/real-mysql.test.js` — integração **real** opcional via MySQL 8 (ambiente de teste isolado).
- `tdd/` — demonstração **reproduzível**, com os 4 ciclos RED/GREEN/REFACTOR.
- `docs/TDD_PLANO_E_EVIDENCIAS.md` — transparência metodológica e relatório de cobertura.
- `src/docs/openapi.yaml` — descrição OpenAPI 3.0.3 de rotas existentes.
- `docs/SWAGGER.md` — uso da interface Swagger.
- `aws/DEPLOY_AWS.md` — execução e checklist AWS, orçamento, HTTPS, EC2 e RDS.
- `aws/deploy-ec2.sh` — deploy EC2 com parâmetros sensíveis do SSM e CA TLS.
- `aws/02_status_basicos.sql` — dados de referência mínimos **sem contas fictícias** para RDS.
- `src/cli/bootstrap-admin.js` — criação interativa e segura da primeira conta ADMIN, apenas por operador no servidor.
- `database/` — scripts originais da Parte 1/2. `02_seed.sql` serve **só para desenvolvimento local**.

## Primeiros comandos (WSL/Linux)

```bash
cp .env.example .env
# Defina DB_PASSWORD e JWT_SECRET com valores seguros e:
# MYSQL_ROOT_PASSWORD=outra_senha_forte
npm install
npm test
npm run test:coverage
npm run test:tdd:red       # 4 falhas esperadas (didático)
npm run test:tdd:green     # 4 aprovações esperadas
npm run test:tdd:refactor  # 4 aprovações esperadas
docker compose up --build -d
curl -i http://localhost:3000/health
# Swagger: http://localhost:3000/api-docs/
# OpenAPI: http://localhost:3000/openapi.json
```

**Importante:** instalar dependências é necessário antes de rodar os testes. Recomenda-se gerar e versionar `package-lock.json` (após `npm install`) para reproduzir as versões; o arquivo não foi gerado neste ambiente sem acesso ao registro npm.

## Situação de validação e limites

Todos os JS foram verificados por `node --check` e o YAML OpenAPI foi analisado estruturalmente. Não se presume que Jest tenha passado, pois o ambiente de autoria não conseguiu instalar os pacotes via npm. Tampouco existe deploy AWS concluído ou URL pública — **a equipe precisa executar os testes e o roteiro no seu ambiente**. Capturas reais e outputs de execução devem ser anexados ao PDF final.

**Sobre TDD:** a Parte 2 precede estes testes. O laboratório didático reconstrói Red/Green/Refactor, mas não substitui commits test-first autênticos. Consulte `docs/TDD_PLANO_E_EVIDENCIAS.md`.

**Escopo preservado:** não há cobrança Mercado Pago, chatbot DeepSeek implementado, front-end/mobile ou aplicação automática de punições. Só rascunhos de reserva e pagamentos administrativos preliminares.
