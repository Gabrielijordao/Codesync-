# Auditoria consolidada das Partes 1, 2 e 3

**Data da revisão:** 24/10/2026. **Base:** arquivos presentes nas entregas 1 a 3 e documento técnico do Checkpoint 2. Não houve execução funcional de banco ou aplicação nesta auditoria.

## Inventário e origem

| Parte | Material analisado | Resultado consolidado |
|---|---|---|
| 1 | `01_schema.sql`, `02_seed.sql`, `03_verificacao.sql`, ARQUITETURA e MODELAGEM | 40 tabelas, scripts reunidos em `database/`; schema/seed existentes; execução real pendente |
| 2 | Código Node, Express, mysql2, controladores, CRUD, middleware, Docker Compose | Código incluído integralmente; não demonstrado em servidor |
| 3 | Swagger, Jest/Supertest, TDD didático, CI, roteiro AWS | Arquivos incluídos; testes e deploy reais não demonstrados |
| 4 | Diagramas `.drawio`, PDF, roteiro e backlog | Documentação nova neste pacote |

## Pontos críticos antes de alegar Checkpoint concluído (P0)

1. **Executar MySQL 8 / Docker e integração completa.** Não houve servidor MySQL nem Docker neste ambiente; `npm run integrity` valida referências estáticas, não SQL ou FK em execução. Executar DDL, seed local, `03_verificacao.sql` e testes com banco isolado.
2. **Executar `npm install` e os testes Jest/Supertest.** O resultado real de cobertura não existe neste material. Criar `package-lock.json` e commitar para builds reproduzíveis, então preferir `npm ci` no GitHub Actions e Dockerfile.
3. **Conferir privilégio e trilha de auditoria real.** `src/services/audit.service.js` intercepta erro de inserção em `tb_log` e apenas registra erro Winston; operação pode retornar sucesso sem log no MySQL. Definir se falha de auditoria deve bloquear operações críticas; medir persistência e alertar falhas.
4. **Ausência de deploy comprovado.** AWS está documentada, não executada. Não inserir prints, endereço público ou custo real inexistente.
5. **Reconciliar escopo professor e pedido da equipe.** As instruções de CP3 mencionam atualização semanal no ProjectLibre e commits semanais; ProjectLibre/ClickUp foram excluídos desta entrega por solicitação do grupo, mas o professor pode cobrar o item oficial 4.9.2. Commits passados não podem ser recriados como evidência histórica.
6. **Modelagem ≠ implementação integral.** `tb_reserva`/`tb_pagamento` e tabelas de SAC existem, mas cotação, disponibilidade, fluxo de confirmação, Mercado Pago, DeepSeek e atendimento ainda não são APIs completas.

## Melhorias recomendadas antes do deploy (P1)

7. Validar que nenhuma conta de `02_seed.sql` e nenhum conteúdo fictício sejam carregados no RDS. O compose local importa `02_seed.sql` apenas quando o volume é criado.
8. Em `reservation.service.js`, criação de reserva não seleciona `id_tipo_quarto` nem bloqueia disponibilidade. Não expor endpoint preliminar como reserva confirmada.
9. `payment.service.js` cria pagamento administrativo `PENDENTE` sem interação com o gateway. Não permitir cliente forjar aprovação; webhook autenticado e conciliação são pendentes.
10. `occurrence.service.js` registra e analisa ocorrências mas não aplica penalidades; o documento de punições prevê advertência/suspensão/bloqueio de cliente, hotel e guia somente após curadoria humana. Acrescentar API e histórico sem automatizar decisão.
11. Autorização e privacidade: verificar em testes de integração CRUD e acesso a registros de outra pessoa, bem como dados pessoais em GET /guias, /usuarios e /ocorrencias.
12. Melhorar observabilidade: correlação `request-id`, política de retenção, métricas, backups e recovery; nenhuma dessas foi verificada em nuvem.
13. Swagger contém as rotas base, mas deve ser confirmado que request/response correspondem ao comportamento HTTP efetivo após execução.
14. Configurar TLS de MySQL no RDS com CA e hostname verificados; `DB_SSL_CA_PATH` é preparatório.
15. Testar timezone/data, reserva no limite do dia e expiração de token; não pressupor conformidade apenas pelos validadores.

## Pontos de atenção documentais

- Requisitos **RF01–RF35 e RNF01–RNF14** constam na tabela do documento técnico CP2; o texto de planejamento anterior citava RNF01–RNF10 e confundia RF26 com logs. Neste repositório, logs correspondem a **RF32–RF34**.
- Diagrama antigo de componentes indica Java/Python; o atual `.drawio` descreve Node.js/Express como definido na implementação.
- TDD `tdd/` é um **laboratório reconstruído** de Red/Green/Refactor; não constitui prova histórica de metodologia test-first no código anterior.
- Não há imagens ou logs genuínos de execução nesta entrega. O PDF relata status em vez de inventar evidências.

## Critério mínimo para marcar o Checkpoint 3 como validado

- [ ] Banco MySQL 8 executado e verificado; schema, FKs, índices e seed local testados
- [ ] `npm ci`, `npm run check`, `npm run integrity` e `npm run test:coverage` passaram
- [ ] `npm run test:db` passou com banco isolado
- [ ] Swagger abre e exemplos de requests/responses batem com o serviço
- [ ] Endpoint público HTTPS comprovado por uma consulta real; RDS conectado e privado
- [ ] Logs persistidos, sem senha/token e com usuário, evento e horário
- [ ] O professor recebeu acesso GitHub e histórico de commits verificável
- [ ] PDF único atualizado com capturas de tela reais e apresentação revisada
