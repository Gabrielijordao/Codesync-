# Histórico original da Parte 1

> Documento preservado para rastreabilidade. O README da raiz e a auditoria técnica da Parte 4 prevalecem.

# HospedJá — Checkpoint 3, Parte 1

**Arquitetura Node.js/Express + esquema MySQL 8 + dados fictícios de teste**  
CodeSync — Grupo 3 — Projetos de Software 2 / UNIUBE

## Arquivos desta entrega

- `docs/ARQUITETURA.md` — arquitetura em camadas, organização de pastas e justificativa.
- `docs/MODELAGEM_E_DECISOES.md` — mapeamento do DER e das classes, divergências e regras pendentes.
- `database/01_schema.sql` — criação de tabelas, PKs, FKs, restrições e índices.
- `database/02_seed.sql` — amostra de dados fictícios, com hashes bcrypt.
- `database/03_verificacao.sql` — contagem, integridade visual e consultas de conferência.
- `validar_estrutura.py` — inspeção estática da estrutura SQL sem dependências externas.

## Requisitos

- MySQL **8.0.16+** (compatível com CHECK aplicado pelo servidor).
- Permissão para criar banco e tabelas no servidor escolhido.
- MySQL Workbench, DBeaver ou cliente `mysql`.

## Executar via terminal

A partir da pasta `HospedJa_CP3_Parte1`:

```bash
mysql -h 127.0.0.1 -u root -p < database/01_schema.sql
mysql -h 127.0.0.1 -u root -p < database/02_seed.sql
mysql -h 127.0.0.1 -u root -p --table < database/03_verificacao.sql
python validar_estrutura.py
```

No **MySQL Workbench/DBeaver**, abra os três scripts e execute nesta ordem. Use uma instância de desenvolvimento.

> **Aviso de segurança:** executar `02_seed.sql` somente em banco acadêmico/local. Cria perfis de administrador/operador de teste com credenciais demonstrativas, nunca usar em AWS/produção. Os logs fictícios não contêm senha nem token.

## Credenciais demonstrativas (somente desenvolvimento)

| Perfil | E-mail | Senha de teste |
|---|---|---|
| Cliente | `cliente@hospedja.example` | `Cliente#CP3_2026!` |
| Admin | `admin@hospedja.example` | `Admin#CP3_2026!` |
| Gestor | `gestor@hospedja.example` | `Gestor#CP3_2026!` |
| Guia | `guia@hospedja.example` | `Guia#CP3_2026!` |
| Operador SAC | `operador@hospedja.example` | `Operador#CP3_2026!` |

Os e-mails `.example` e os hotéis são fictícios. O banco armazena **somente os hashes bcrypt**; as senhas em texto acima existem apenas nesta documentação de ambiente acadêmico e não devem ser usadas em sistemas reais.

## O que comprovar na avaliação

1. Diagrama DER v4 mapeado para tabelas MySQL físicas.
2. No MySQL Workbench, mostrar `tb_usuario`, `tb_reserva`, `tb_pagamento`, `tb_guia`, `tb_ocorrencia`, `tb_atendimento` e `tb_log`.
3. Demonstrar FKs, CHECKs, índices e tabelas de histórico.
4. Executar as consultas de `03_verificacao.sql`.
5. Explicar que as regras de prazo de pagamento, overbooking e punição dependem de implementação segura no backend e **ainda não estão prontas**.

## Nota sobre testes

A inspeção estática automatizada (`validar_estrutura.py`) verifica a consistência dos arquivos, mas **não substitui a execução contra MySQL real**. Nesta entrega, a inicialização SQL real não foi executada porque não havia servidor MySQL neste ambiente. O teste funcional de banco, HTTP e TDD será registrado nas próximas partes.

## Atenção à numeração dos requisitos

O documento técnico dentro do ZIP do Checkpoint 2 enumera **RF01–RF35** e **RNF01–RNF14**. Os logs são **RF32–RF34**; o RF26 trata da resposta automatizada do chatbot. O `message.txt` resume uma versão anterior dos requisitos.
