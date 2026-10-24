# HospedJá — Checkpoint 3 — Parte 1: arquitetura

**Equipe:** CodeSync, Grupo 3 (cinco integrantes)  
**Disciplina:** Projeto de Software 2 — UNIUBE  
**Tecnologia aprovada:** Node.js + Express.js, MySQL 8, Docker e AWS

## 1. Proposta técnica

Adota-se uma API REST em Node.js/Express.js, separada em camadas para permitir testes automatizados, manutenção e reutilização por um cliente web e por um aplicativo mobile futuro.

```text
Navegador / Swagger / App futuro
             |
             v
    HTTP + middlewares
(CORS, JWT, validação, erros)
             |
             v
           ROUTES
             |
             v
         CONTROLLERS
             |
             v
          SERVICES  ----> Auditoria / log estruturado
             |
             v
        REPOSITORIES
             |
             v
         MySQL 8 / RDS

Integrações futuras (somente por SERVICES): Mercado Pago e DeepSeek.
```

**Routes:** associação entre método/caminho e controller.  
**Controllers:** recepção de parâmetros e respostas HTTP.  
**Services:** operações de domínio, autorização por perfil, coordenação de transações e auditoria.  
**Repositories:** SQL parametrizado via `mysql2/promise`, nunca concatenação de entrada do usuário.  
**Middlewares:** autenticação JWT, validação de entrada, CORS e erros globais.

## 2. Estrutura prevista para a Parte 2

```text
hospedja-backend/
├── src/
│   ├── app.js                     # Express sem listen, importado nos testes
│   ├── server.js                  # Inicialização e conexões
│   ├── config/{database,env}.js
│   ├── routes/                    # auth, usuarios, hoteis, quartos, reservas, pagamentos, guias, ocorrencias, atendimentos
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/               # authenticate, authorize, errorHandler, validate
│   ├── validators/                # zod ou express-validator
│   ├── utils/                     # logger, bcrypt, jwt
│   └── docs/openapi.yaml
├── database/
│   ├── 01_schema.sql              # entregue nesta parte
│   ├── 02_seed.sql                # entregue nesta parte
│   └── 03_verificacao.sql         # entregue nesta parte
├── tests/{unit,integration}/
├── Dockerfile                     # Parte 2
├── compose.yaml                   # Parte 2
├── .env.example                   # Parte 2
└── package.json                   # Parte 2
```

## 3. Justificativa para o professor

> A equipe adotou Node.js e Express.js para disponibilizar serviços REST, com MySQL 8 como banco relacional. A arquitetura em camadas isola transporte HTTP, regras de aplicação e persistência, facilitando o uso de TDD com Jest e Supertest. Os logs e a autenticação são recursos transversais, e as integrações com Mercado Pago e DeepSeek serão encapsuladas em serviços específicos. O deploy previsto é na AWS, mantendo credenciais em variáveis de ambiente.

## 4. Estratégia para os próximos itens

- **Parte 2:** API Express + bcrypt/JWT + CRUD + logs + Docker, usando o esquema desta entrega.
- **Parte 3:** TDD (Red → Green → Refactor), cobertura, OpenAPI/Swagger e passo a passo de implantação AWS. O TDD precederá cada implementação na sequência didática dos artefatos.
- **Parte 4:** diagramas de interação UML, ProjectLibre/ClickUp, PDF único e apresentação.

### Regras de arquitetura obrigatórias

1. Não armazenar senhas em texto puro ou tokens em logs.
2. Não confiar em valores financeiros informados pelo frontend ao concluir pagamentos; cálculo e autorização ficarão no backend na etapa de regras de negócio.
3. Não confirmar reserva sem verificação de disponibilidade e transação atômica no backend (RN03/RNF06).
4. As punições dependem de análise e decisão humana; a simples ocorrência não implica penalidade (RN04).
5. Autenticação e autorização por perfil são obrigatórias para operações protegidas (RN02/RNF04).
6. Nunca transportar chaves de Mercado Pago/DeepSeek ao frontend (RNF07).
