# HospedJá - Checkpoint 3 | CodeSync (Grupo 3)

**Disciplina:** Projeto de Software 2 - UNIUBE  
**Status:** backend acadêmico inicial + documentação + plano de validação. **Não é versão de produção.**  
**Consolidação:** Partes 1, 2, 3 e 4 em um único repositório, 24/10/2026.  
**Equipe:** 5 integrantes (inserir nomes reais).

## Acesso rápido

| Documento | Para que serve |
|---|---|
| [Resumo executivo](docs/RESUMO_EXECUTIVO.md) | O que foi feito, o que falta, pontos críticos |
| [Revisão das partes 1–3](docs/REVISAO_GERAL.md) | Auditoria técnica e limites de validação |
| [Matriz RF01–RF35/RNF01–RNF14](docs/MATRIZ_REQUISITOS_CP2.md) | Cobertura dos requisitos originais |
| [Divisão da equipe e backlog](docs/DIVISAO_EQUIPE_E_BACKLOG.md) | Tarefas para abrir como GitHub Issues |
| [Como testar e registrar evidências](docs/TESTES_E_EVIDENCIAS.md) | Passo a passo local, Jest, MySQL e prints |
| [Diagramas](docs/DIAGRAMAS_INTERACAO.md) | Seis diagramas de interação `.drawio` editáveis |
| [Roteiro de apresentação](docs/ROTEIRO_APRESENTACAO_6_MINUTOS.md) | Fala dividida entre os cinco colegas |
| [PDF único](entrega/HospedJa_Checkpoint3_Documento_Unico.pdf) | Relatório acadêmico preliminar |
| [Roteiro AWS](aws/DEPLOY_AWS.md) | Proposta EC2+RDS, sem recursos provisionados |
| [Rotas e perfis](docs/ROTAS_E_PERMISSOES.md) | Contrato HTTP e permissões |

## 1. O que já foi desenvolvido (presença de código, NÃO execução comprovada)

- SQL MySQL 8 com **40 tabelas**, PK/FK, restrições, índices, seed local e script de verificação.
- API Node.js 22 + Express em camadas `routes → controllers → services → repositories`.
- Cadastro/login/troca de senha; `bcrypt`, JWT, validação Zod, middleware de autorização.
- Rotas de usuários, hotéis, quartos, guias, reservas em rascunho, pagamentos administrativos preliminares, ocorrências e revisão humana.
- Auditoria de requisições mutantes com `Winston` e `tb_log`; persistência deve ser validada.
- Documentação `/api-docs/` (Swagger) e `/openapi.json`.
- Testes unitários/HTTP (Jest/Supertest), integração opcional MySQL e laboratório TDD didático.
- Dockerfile, Compose, CI GitHub Actions e roteiro AWS (EC2, RDS, SSM/HTTPS).
- **Parte 4:** seis `.drawio`, PDF, roteiro de apresentação e issues/PR para colaboração.

## 2. O que NÃO está pronto

Pesquisa inteligente, disponibilidade por período, cotação, reserva confirmada, pagamento/estorno Mercado Pago, regra de pagamento até 7 dias, DeepSeek, SAC por API, penalidades após análise humana, app mobile e deploy público. A camada de persistência não significa que as operações estão implementadas. Ver [matriz de requisitos](docs/MATRIZ_REQUISITOS_CP2.md).

## 3. Estrutura resumida

```text
src/
  routes/ controllers/ services/ repositories/ middlewares/
  config/ validators/ utils/ docs/openapi.yaml
  app.js server.js
database/       01_schema.sql 02_seed.sql 03_verificacao.sql
tests/          unit/ http/ db/
tdd/            laboratorio didatico Red-Green-Refactor
diagramas/       6 diagramas .drawio + previews .png
entrega/         PDF único para revisão
aws/             roteiro e scripts de implantação
docs/            revisão, backlog, requisitos e apresentação
referencias/     artefatos CP2 fornecidos pela equipe
```

## 4. Requisitos do ambiente

- Node.js **22** (ou superior compatível), npm, Docker + Docker Compose, Git.
- MySQL 8 (via Compose) e cliente opcional DBeaver/MySQL Workbench.
- Nunca versionar `.env`, dados reais ou segredos.

## 5. Rodar a API local com Docker

```bash
cp .env.example .env
# edite .env e acrescente também MYSQL_ROOT_PASSWORD=<valor forte>
# substitua DB_PASSWORD, JWT_SECRET e demais placeholders
# NODE_ENV=development para testes locais

docker compose up --build -d
docker compose ps
curl http://localhost:3000/health
```

No primeiro start com volume novo, Compose executa `01_schema.sql` + **seed FICTÍCIO**. Ele **não** deve ser usado para dados reais/produção. `/health` deve responder com JSON `status: ok` e banco acessível. Swagger: `http://localhost:3000/api-docs/`.

Para executar sem Docker, suba MySQL, aplique `database/01_schema.sql` e `database/02_seed.sql` **apenas local**, ajuste `.env`, instale dependências e rode `npm run dev`.

## 6. Testes, cobertura e TDD

```bash
npm install               # gerar package-lock.json e versioná-lo
npm run check
npm run integrity
npm test
npm run test:coverage    # relatório HTML: coverage/index.html
npm run test:tdd:red     # falha intencional para demonstrar Red
npm run test:tdd:green
npm run test:tdd:refactor
```

**Testes com MySQL real isolado:** siga [docs/TESTES_E_EVIDENCIAS.md](docs/TESTES_E_EVIDENCIAS.md); serviço em `compose.integration.yaml`. Nunca executar contra RDS de produção.

**Nota acadêmica:** `tdd/` foi criado como demonstração **posterior** às implementações das partes anteriores. Novas funcionalidades devem manter histórico real test-first em PRs.

## 7. API REST e perfis

Base URL: `http://localhost:3000/api/v1`. Autenticação: `Authorization: Bearer <JWT>`. Exemplos em `examples/requisicoes.http`.

| Prefixo | Função atual |
|---|---|
| `/auth` | register, login, password |
| `/usuarios` | meu perfil, administração |
| `/hoteis`, `/quartos`, `/guias` | CRUD com autorizações por papel |
| `/reservas` | rascunhos pendentes e cancelamento restrito |
| `/pagamentos` | leitura e criação administrativa preliminar |
| `/ocorrencias` | registro, leitura e análise por ADMIN |

O projeto mantém serviços e validações separados da camada HTTP. `src/docs/openapi.yaml` é a especificação detalhada.

## 8. AWS: NÃO implantado

`aws/DEPLOY_AWS.md` documenta EC2 + RDS MySQL privado, SSM Parameter Store e Nginx/HTTPS. **Ainda não foi criado nenhum recurso AWS com esta entrega, nem obtida URL pública ou custo observado.** Só seguir esse roteiro após autorização da equipe e orçamento aprovado.

## 9. GitHub: como compartilhar com os cinco integrantes

1. Crie um repositório privado/compartilhado `hospedja-checkpoint3` e adicione os cinco colaboradores e o professor, conforme orientação dele.
2. Extraia o ZIP, abra terminal na **raiz** e rode:

```bash
git init
git add .
git commit -m "chore(cp3): consolidar backend, diagramas e documentacao"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

3. Abra as issues listadas em `docs/DIVISAO_EQUIPE_E_BACKLOG.md`, distribua responsáveis e peça PRs revisadas.
4. Garanta commits semanais futuros; não invente commits históricos.
5. Configurar GitHub Actions após gerar `package-lock.json` e validar as dependências.

## 10. Entrega para a disciplina

`entrega/HospedJa_Checkpoint3_Documento_Unico.pdf` é um relatório preliminar consolidado; atualizar com **prints reais** antes de submeter. Também conferir se o professor espera as fontes dos diagramas além do PDF. O comunicado oficial prevê documento + artefatos em **PDF único** e apresentação do grupo.

**ProjectLibre/ClickUp:** não incluídos por solicitação da equipe. Isso não elimina eventual exigência oficial de atualização semanal no ProjectLibre; confirmar com o professor.

## 11. Segurança e limitações

- SQL parametrizado, bcrypt e JWT estão presentes, mas dependem de testes executados.
- A gravação em `tb_log` é **best-effort** (erros no banco são logados e não bloqueiam a requisição). Avaliar política de auditoria em operações críticas.
- Não rodar o seed do Compose em RDS ou produção. O bootstrap de administrador para AWS existe em `src/cli/bootstrap-admin.js`.
- A revisão estática confirma apenas sintaxe e coerência estrutural; testes, cobertura, Docker e AWS precisam de execução real.

Leia também [CONTRIBUTING.md](CONTRIBUTING.md) e [docs/REVISAO_GERAL.md](docs/REVISAO_GERAL.md) antes de abrir a primeira PR.
