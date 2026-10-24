# Contratos REST — HospedJá CP3 / Parte 2

Prefixo: `/api/v1`. Resposta de sucesso: `{ "data": ... }`; falha: `{ "error": { "code": "...", "message": "..." } }`.

Perfis: `CLIENTE`, `ADMIN`, `OPERADOR_SAC`, `GESTOR_HOSPEDAGEM`, `GUIA`. O perfil **nunca** é fornecido no cadastro público e é sempre consultado no banco, não confiado do JWT.

## Endpoints

| Método | Caminho | Permissão | Efeito |
|---|---|---|---|
| GET | `/health` (sem prefixo) | Público | Verifica processo e conexão MySQL |
| POST | `/auth/register` | Público, limitador de tentativas | Cria CLIENTE; bcrypt |
| POST | `/auth/login` | Público, limitador de tentativas | Emite JWT com sub ID |
| PATCH | `/auth/password` | Autenticado | Troca senha após validar senha atual |
| GET | `/usuarios/me` | Autenticado | Próprio perfil sem hash |
| PATCH | `/usuarios/me` | Autenticado | Atualiza nome, telefone e nascimento |
| GET | `/usuarios` | ADMIN | Lista 100 perfis sem hashes |
| POST | `/usuarios` | ADMIN | Cadastra GUIA, GESTOR_HOSPEDAGEM ou OPERADOR_SAC com senha criptografada |
| GET | `/usuarios/:id` | ADMIN | Obtém perfil sem hash |
| PATCH | `/usuarios/:id/status` | ADMIN | Altera status da conta |
| GET | `/hoteis`, `/hoteis/:id` | Público | Lista ativos; ADMIN vê também inativos |
| POST | `/hoteis` | ADMIN | Cria hotel |
| PATCH | `/hoteis/:id` | ADMIN ou gestor associado | Atualiza dados autorizados |
| DELETE | `/hoteis/:id` | ADMIN | Desativação lógica |
| POST | `/hoteis/:id/gestores` | ADMIN | Vincula usuário GESTOR_HOSPEDAGEM ativo ao hotel |
| DELETE | `/hoteis/:id/gestores/:usuarioId` | ADMIN | Desativa vínculo do gestor com hotel |
| GET | `/quartos`, `/quartos/:id` | Público | Lista disponíveis de hotel ativo; ADMIN vê todos |
| POST | `/quartos` | ADMIN ou gestor associado ao hotel | Cria tipo de quarto |
| PATCH | `/quartos/:id` | ADMIN ou gestor associado | Atualiza tipo de quarto |
| DELETE | `/quartos/:id` | ADMIN ou gestor associado | Desativação lógica |
| GET | `/guias`, `/guias/:id` | Público | Guias ativos aprovados; documentos privados ocultos |
| POST | `/guias` | ADMIN | Cria guia interno/externo |
| PATCH | `/guias/:id` | ADMIN ou próprio guia interno | Guia não edita aprovação nem status |
| DELETE | `/guias/:id` | ADMIN ou próprio guia interno | Desativação lógica |
| GET | `/reservas`, `/reservas/:id` | Proprietário ou ADMIN | Lê próprias reservas (ADMIN: todas) |
| POST | `/reservas` | Autenticado | Cria rascunho pendente sem preço/estoque |
| PATCH | `/reservas/:id` | Proprietário ou ADMIN | Edita observações de pendente |
| DELETE | `/reservas/:id` | Proprietário ou ADMIN | Cancela somente rascunho SEM pagamento |
| GET | `/pagamentos`, `/pagamentos/:id` | Proprietário ou ADMIN | Histórico próprio, sem transação externa no retorno ao cliente |
| POST | `/pagamentos` | ADMIN | Cria lançamento preliminar PENDENTE, sem cobrança |
| GET | `/ocorrencias`, `/ocorrencias/:id` | Autor ou ADMIN | Consulta próprio registro |
| POST | `/ocorrencias` | Autenticado | Abre ocorrência |
| PATCH | `/ocorrencias/:id/analise` | ADMIN | Análise e decisão HUMANA, sem punição |

Endereços, fotos, favoritados, hóspedes, histórico, SAC e reservas de guia estão modelados em MySQL, **mas não receberam CRUD HTTP nesta primeira versão de API**. Não confundir estrutura de banco preparada com endpoint implementado.

## Exemplos de JSON

Registro: `POST /auth/register`

```json
{"nome":"Maria","email":"maria@example.com","senha":"TesteForte#2026","telefone":"34999998888"}
```

Cadastrar gestor: `POST /usuarios` (ADMIN):

```json
{"nome":"Novo Gestor","email":"gestor.novo@example.com","senha":"GestorSeguro#2026","tipo_usuario":"GESTOR_HOSPEDAGEM"}
```

Vincular gestor: `POST /hoteis/1/gestores` (ADMIN):

```json
{"id_usuario":"3"}
```

Quarto: `POST /quartos` (ADMIN ou gestor do hotel informado):

```json
{"id_hotel":"1","nome":"Suite Executive","tipo":"SUITE","capacidade":2,"valor_diaria":289.90,"quantidade_disponivel":3}
```

Rascunho de reserva: `POST /reservas` (não bloqueia disponibilidade):

```json
{"checkin":"2027-06-15","checkout":"2027-06-20","quantidade_hospedes":2,"observacoes":"Viagem demonstrativa"}
```

Ocorrência: `POST /ocorrencias`:

```json
{"tipo_alvo":"HOTEL","id_alvo":"1","tipo_ocorrencia":"INFORMACAO_INCORRETA","descricao":"Descricao ficticia para demonstracao de ocorrencia"}
```

Análise humana: `PATCH /ocorrencias/1/analise` (ADMIN):

```json
{"status":"IMPROCEDENTE","analise":"Registro avaliado manualmente, sem evidencias suficientes."}
```

## Contratos e histórico do Checkpoint 2

- A classe `Hospedagem` é a tabela `tb_hotel`; `Quarto` corresponde a `tb_tipo_quarto`, refletindo o DER v4 (Parte 1).
- Log de autenticação, alterações, reservas, cancelamentos e decisões usa `tb_log` com usuário, evento, recurso, IP e data. O documento técnico mais recente atribui logs a **RF32–RF34**, e RF26 ao chatbot (divergência em `message.txt`).
- A política de pagamentos do diagrama de sequência (prazo de 7 dias) **ainda não é implementada**; nenhuma reserva pode ser confirmada por esta API preliminar. O fluxo real exige validação de disponibilidade, preço e webhook autenticamente verificado.
- A ocorrência não gera penalidade automática. O módulo `tb_penalidade` existe no banco para etapa posterior, conforme o documento de punições.
- Campo `senha_hash` jamais retorna por HTTP. `documento_identidade` de guias externos e internos não é divulgado em consulta pública. Conexões ficam em variáveis de ambiente.

## Códigos HTTP

- `200` consulta/edição; `201` cadastro/criação; `204` troca de senha;
- `400` JSON malformado; `401` login/token inválido; `403` falta de permissão;
- `404` registro/rota ausente; `409` duplicado ou transição não permitida;
- `422` campo inválido, FK inexistente ou regra simples de entrada; `429` limite de tentativas; `500` falha inesperada.

## Pendências para validação final

- Testes de integração contra MySQL 8 real e correção de qualquer incompatibilidade observada.
- TDD documentado com Jest/Supertest e cobertura (Parte 3).
- OpenAPI/Swagger com schemas e exemplos (Parte 3).
- Revisar permissões de operações administrativas em produção, controles de concorrência, disponibilidade, preços, pagamentos e auditoria transacional.
