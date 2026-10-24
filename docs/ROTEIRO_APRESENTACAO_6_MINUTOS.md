# Roteiro de apresentação - Checkpoint 3 (6 minutos)

**Papéis genéricos:** trocar Integrante 1...5 pelos nomes reais. Não alegar evidências que ainda não foram coletadas.

| Tempo | Pessoa | Tela/slide e fala sugerida |
|---|---|---|
| 0:00–0:45 | Integrante 1 | Identificação CodeSync, problema HospedJá e objetivos: API REST modular e persistência MySQL. |
| 0:45–1:50 | Integrante 1 + 2 | Diagrama de camadas e autenticação: routes/controllers/services/repositories; bcrypt/JWT e controle de papéis. |
| 1:50–2:55 | Integrante 2 + 3 | Modelagem: 40 tabelas, DER CP2, hospedagens/quartos/guias, reservas e pagamentos preliminares. Abrir diagrama de reservas. |
| 2:55–4:00 | Integrante 3 + 4 | TDD e qualidade: explicar Red/Green/Refactor como laboratório; mostrar resultado real do Jest/coverage se já tiver rodado. Swagger e rotas. |
| 4:00–4:55 | Integrante 4 | Docker e AWS: mostrar ambiente local rodando se disponível; arquitetura EC2 + RDS privado; se não houver deploy, explicar que é roteiro pendente. |
| 4:55–5:40 | Integrante 5 | Auditoria, ocorrências com análise humana e matriz de requisitos; diferenciar cobertura inicial de futuras integrações Mercado Pago/DeepSeek. |
| 5:40–6:00 | Integrante 5 | Próximos passos e status: testes reais, URL pública, revisão do PDF e commits semanais. |

## Slides / telas (7 telas)

1. Capa: HospedJá / CodeSync / Grupo 3 / Checkpoint 3.
2. Arquitetura de serviços Node.js + Express.js.
3. MySQL: entidades e modelagem de reserva.
4. Segurança: cadastro, login, JWT e controle de acesso.
5. Testes: Jest, Supertest, laboratório TDD e cobertura **real**.
6. Swagger, Docker, logs e AWS.
7. Entregas, pendências, responsáveis e conclusão.

## Perguntas prováveis do professor

- **Onde o TDD foi usado?** Há testes e laboratório Red/Green/Refactor reconstruído; o grupo precisa demonstrar evolução test-first em novos commits.
- **O Mercado Pago está integrado?** Não; existe preparação de tabelas/endpoints, sem webhook real.
- **Por que o cancelamento não tem reembolso?** A API atual só cancela rascunhos sem pagamentos. Estorno pertence à etapa de regra de negócio/gateway.
- **Onde está o deploy na nuvem?** O roteiro e scripts existem, mas a URL pública só será apresentada após implantação e verificação reais.
- **Como evitar punição automática?** Ocorrências são analisadas por ADMIN; não há aplicação automática de penalidades.
- **Como validaram os requisitos?** Matriz em `docs/MATRIZ_REQUISITOS_CP2.md`; a maioria é parcial ou pendente neste checkpoint.
