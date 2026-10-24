# Divisão de trabalho para 5 integrantes - CodeSync

Os nomes não foram informados; substituir **Integrante 1...5** pelos membros reais e cadastrar as tarefas como issues do GitHub. A divisão contempla finalizar e validar o que foi entregue, sem prometer sistemas prontos.

| Responsável | Área | Entregas e Issues sugeridas | Critério objetivo de conclusão |
|---|---|---|---|
| Integrante 1 | Banco / persistência | **P0 DB-01:** executar MySQL 8, testar schema, seed e `03_verificacao.sql`; **DB-02:** migrar e documentar índices; **DB-03:** validar inconsistências DER × classes | SQL executado, prints/saídas reais, queries sem falhas, PR do banco |
| Integrante 2 | Autenticação / segurança | **P0 AUTH-01:** validar cadastro/login JWT/bcrypt e troca de senha; **AUTH-02:** revisão de permissões/privacidade; **AUTH-03:** configurar segredos/CA TLS | Testes negativos, token inválido, hash, acessos negados e PR revisado |
| Integrante 3 | Reservas / pagamentos | **P0 REST-01:** testar API de reservas preliminares; **REST-02:** documentar pendência de disponibilidade e regra 7 dias; **PAY-01:** preparar contrato webhook Mercado Pago com testes de idempotência, sem ativar confirmação fictícia | Testes com BD isolado e sem prometer integração real; PR + OpenAPI revisado |
| Integrante 4 | Qualidade / DevOps | **P0 QA-01:** instalar dependências, gerar lockfile e executar testes/cobertura; **QA-02:** subir Docker Compose; **P0 AWS-01:** deploy EC2+RDS privado e HTTPS (somente após autorização da equipe); **QA-03:** CI GitHub Actions | Logs/testes reais, screenshot CI, URL HTTPS e checklist AWS somente se realmente obtidos |
| Integrante 5 | Documentação / interface / SAC | **P0 DOC-01:** revisar diagramas e OpenAPI, consolidar PDF único; **DOC-02:** preparar apresentação e evidências; **SAC-01:** especificar rotas e testes DeepSeek/SAC; **OCO-01:** projetar aplicação manual de penalidades | PDF com evidências reais, diagramas validados, roteiro ensaiado e issues de integração |

## Dependências e ordem prática

1. Integrante 1 entrega MySQL local; Integrantes 2 e 3 dependem de dados estáveis.
2. Integrante 4 gera lockfile e valida pipeline em paralelo aos testes dos integrantes 2 e 3.
3. Integrante 5 valida contrato Swagger com o backend, recolhe evidências reais e fecha PDF/apresentação.
4. Após validação local e autorização de custos, Integrante 4 provisiona AWS e coordena confirmação com 1 e 2.

## Backlog priorizado para abrir como issues

**P0 - bloqueia demonstração funcional**
- DB-01 Executar schema + seed no MySQL 8 e comprovar integridade
- QA-01 Instalar dependências, produzir `package-lock.json`, executar Jest e registrar cobertura
- QA-02 Executar Compose e validar health + CRUD e auditoria
- AUTH-01 Validar fluxos cadastro/login/401/403/alteração de senha
- REST-01 Validar rascunhos de reservas, alterações e cancelamento restrito
- DOC-01 Atualizar documentação com outputs reais e informações da equipe
- AWS-01 Provisionar endpoint público HTTPS, RDS privado e comprovar conexão (se obrigatório para checkpoint)

**P1 - incremento posterior / dependente de requisitos**
- REST-02 Seleção e disponibilidade de quartos, bloqueio de estoque, preço
- PAY-01 Mercado Pago (webhook autenticado, conciliação e idempotência)
- OCO-01 Processo administrativo de punições sem decisão automática
- SAC-01 API de mensagens, DeepSeek, operador e histórico
- QA-03 Cobertura de privacidade, carga, falhas de banco e integrações
- DOC-02 Evidências GitHub semanais e alinhamento com item ProjectLibre do professor

## Convenção de commits e branches

`feat/auth-jwt`, `fix/indices-mysql`, `test/cobertura-reservas`, `docs/diagramas-interacao`, `ci/testes-github`, `chore/lockfile`.

Exemplos: `test(auth): validar credenciais e token expirado`, `fix(reservas): impedir cancelamento com pagamento`, `docs(cp3): consolidar PDF e matriz RF`, `ci(github): ativar cobertura`.

Todos os PRs precisam de evidência de teste ou justificativa de não execução. **Não inventar histórico semanal de commits.**
