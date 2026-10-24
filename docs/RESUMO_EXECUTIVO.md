# Resumo executivo para compartilhar com a equipe

## O que foi produzido

- **Parte 1:** arquitetura em camadas, script `01_schema.sql` (40 tabelas), seed fictício e script de verificação.
- **Parte 2:** API REST Node.js/Express, cadastro/login com bcrypt/JWT, rotas de usuários, hospedagens, quartos, guias, rascunhos de reservas, pagamentos preliminares, ocorrências, auditoria, Docker.
- **Parte 3:** suíte Jest/Supertest, integração opcional MySQL, laboratório didático Red/Green/Refactor, OpenAPI/Swagger e roteiro AWS EC2/RDS + CI.
- **Parte 4:** seis diagramas editáveis `.drawio`, documento único em PDF, apresentação de 6 min, auditoria, matriz de RF/RNF, divisão de tarefas e organização pronta para versionar.

## O que ainda precisa ser testado

- Instalar dependências e rodar Jest/Supertest com cobertura real; emitir `package-lock.json`.
- Subir MySQL 8/Docker, executar scripts SQL e verificar FKs/constraints.
- Rodar testes DB isolados, endpoints REST, autorização e logs persistidos.
- Validar Swagger contra a API em execução.
- Implantar EC2/RDS, habilitar HTTPS e medir custos/segurança antes de afirmar que há deploy.

## O que ainda precisa ser implementado

- Pesquisa por destino, quartos disponíveis, valores, reservas confirmadas.
- Mercado Pago real, webhook autenticado, idempotência, estorno, regra 7 dias.
- SAC/Ouvidoria, API DeepSeek, atendimento humano e histórico funcional.
- Aplicação manual de punições após análise, com trilha de auditoria.
- Melhorias de confiabilidade: falhas de auditoria, sessões JWT, paginação, testes negativos, monitoração.

## Quem fará o quê

**Integrante 1:** DB e migrações. **Integrante 2:** autenticação e permissões. **Integrante 3:** reservas/pagamentos. **Integrante 4:** testes/Docker/AWS/CI. **Integrante 5:** diagramas/PDF/Swagger/SAC/ocorrências. Detalhes e critérios em `docs/DIVISAO_EQUIPE_E_BACKLOG.md`.

## Atenção

O pacote é uma **base de trabalho para o grupo**, não um produto pronto. A análise sintática estática não equivale a testes de runtime; não há URL AWS nem relatórios de cobertura comprovados aqui.
