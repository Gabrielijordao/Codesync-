# Swagger / OpenAPI

Arquivo canônico: `src/docs/openapi.yaml` (OpenAPI 3.0.3).

Com a API rodando:

- Interface Swagger UI: `http://localhost:3000/api-docs/`
- Especificação JSON: `http://localhost:3000/openapi.json`
- Health: `http://localhost:3000/health`

Fluxo: `POST /api/v1/auth/register` → `POST /api/v1/auth/login` → copiar o campo `data.token` → botão **Authorize** no Swagger → colar somente token JWT (a UI acrescenta `Bearer`).

**Escopo:** documentação dos endpoints efetivamente implementados. O Swagger não cria integração Mercado Pago, não executa punições automáticas nem define preços comerciais. Validações mais específicas devem usar `src/validators/schemas.js` como fonte de verdade. `PATCH` aceita apenas os campos parciais permitidos pelas validações; o schema OpenAPI de criação serve como referência dos campos possíveis.

Teste rápido: `curl -s http://localhost:3000/openapi.json | head`.
