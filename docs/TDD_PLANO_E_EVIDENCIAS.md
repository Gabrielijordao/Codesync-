# TDD — Checkpoint 3 — CodeSync

## Distinção metodológica obrigatória

A **Parte 2 foi implementada antes da criação destes testes**, logo NÃO é correto afirmar que toda essa versão nasceu de TDD. O laboratório `tdd/` reproduz honestamente as etapas **Red → Green → Refactor** para quatro funcionalidades, e `tests/` verifica o código efetivo da Parte 2. Use os ciclos reais e commits test-first para as próximas funcionalidades.

## Demonstrar para o professor (laboratório independente)

```bash
npm ci           # se package-lock.json existir; do contrario npm install
npm run test:tdd:red       # ESPERADO: 4 falhas e codigo de saida 1
npm run test:tdd:green     # ESPERADO: 4 testes passando
npm run test:tdd:refactor  # ESPERADO: 4 testes passando
```

O `red.js` contém funções propositalmente não implementadas; `green.js` contém o código mínimo; `refactor.js` separa responsabilidades e preserva o contrato. Os quatro cenários são: hash bcrypt, cadastro, login JWT e log seguro. Para cada etapa, faça captura de tela com o comando e saída.

## Testes do backend real entregue (com mocks/repositório simulado)

```bash
npm test
npm run test:unit
npm run test:http
npm run test:coverage
```

Na API testada, `tests/unit` cobre regras de hash/JWT, serviços de autenticação, troca de senha e auditoria. `tests/http` usa **Supertest com Express real**, validação, middlewares e serviços, mas SUBSTITUI repositórios e alguns serviços com mocks. **Não constitui teste de integração com banco de dados.** O relatório HTML será gerado em `coverage/index.html`; o resumo textual exibirá linhas, ramos, funções e instruções. O `jest.config.cjs` estabelece limites iniciais de cobertura global de 60% das linhas e 45% dos ramos para os módulos selecionados; esses valores só serão comprovados quando a equipe executar `npm run test:coverage`.

## Teste de integração MySQL REAL

Use apenas ambiente de teste isolado: **nunca** banco de produção. No Compose, o banco de desenvolvimento inclui seed; não reutilize esse banco para a nuvem.

```bash
# Após docker compose up --build -d e com MySQL acessível no HOST:
RUN_DB_TESTS=1 DB_HOST=127.0.0.1 DB_PORT=3307 \
  DB_NAME=hospedja DB_USER=hospedja_app DB_PASSWORD='SUA_SENHA_LOCAL' \
  JWT_SECRET='SEGREDO_LOCAL_COM_MAIS_DE_32_CARACTERES' npm run test:db
```

Esse teste efetivamente cria um usuário temporário, confere a coluna `senha_hash`, realiza login e procura os eventos de auditoria na `tb_log`, removendo os dados temporários em seguida. Ele depende de MySQL 8, schema e seed de status inicializados; requer *dotenv* e variáveis correspondentes. **Executá-lo altera tabelas do banco selecionado**. Se o projeto usa WSL, rode diretamente no terminal WSL, não em PowerShell (sintaxe de atribuição de variáveis diferente).

## Commits para reproduzir o fluxo daqui para frente

1. `test(auth): descreve cenário que inicialmente falha` — execute e registre falha.
2. `feat(auth): implementa mínimo para teste passar` — execute e registre verde.
3. `refactor(auth): extrai política sem alterar contrato` — execute todos os testes.
4. `docs(tdd): anexa relatório de cobertura e evidências` — anexe prints na entrega.

Repetir esse padrão por hash, cadastro, login e log em novas evoluções ou laboratórios verdadeiros; NÃO reescrever histórico dos commits da Parte 2.
