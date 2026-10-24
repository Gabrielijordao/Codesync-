# HospedJá — decisões de modelagem e rastreabilidade

## Fontes fornecidas pela equipe

- **DER v4** em `HospedJa_DER_v4.drawio`, extraído do ZIP `Checkpoint2.zip.zip`.
- **Documento técnico completo** do Checkpoint 2 (`.docx` dentro do ZIP), que contém **RF01 a RF35, RNF01 a RNF14 e RN01 a RN06**.
- **Diagrama de classes atualizado**, com `Usuario`, `Cliente`, `Admin`, `Guia`, `GestorHospedagem`, `Hospedagem`, `Quarto`, `Reserva`, `Pagamento`, `ReservaHospede`, `MidiaHospedagem`, `Pesquisa` e `FiltroPesquisa`.
- **Sistema de Ocorrências, Análise e Punições**, que amplia ocorrência e penalidade para clientes, hotéis e guias.
- **Diagrama de sequência de pagamento e cancelamento**, com status PENDENTE, APROVADO, RECUSADO, EXPIRADO, ESTORNADO e fluxos relacionados.
- **message.txt**, com instruções do Checkpoint 3.

## Divergências entre modelos e decisões adotadas

| Ponto | Modelos de origem | Decisão física nesta Parte 1 |
|---|---|---|
| Hospedagem x hotel | Classe `Hospedagem`; DER `tb_hotel` | Usar `tb_hotel` como hospedagem e `tb_endereco` 1:1. |
| Quarto x tipo de quarto | Classe `Quarto`; DER `tb_tipo_quarto` com estoque | Usar `tb_tipo_quarto` com `quantidade_disponivel`; quartos individuais exigiriam evolução posterior. |
| Cliente/Admin/Guia/Gestor | Herança de `Usuario` no diagrama de classes; tabelas separadas no DER | `tb_usuario.tipo_usuario` como discriminador; `tb_guia.id_usuario` e `tb_admin_hotel.id_usuario` associam identidades. `tb_guia` reúne atributos dos subtipos internos e externos, sem duplicar tabelas de subtipo do DER; o atributo `tipo_guia` diferencia os perfis. |
| Guia externo | Documento técnico descreve guia externo como ator de contato | Pode existir `tb_guia` sem `id_usuario`, e o contato acontece externamente. Guia interno exige `id_usuario`. |
| Comodidades | RF05 exige detalhes; classe remove `Comodidade`/`QuartoComodidade` | `tb_hotel.comodidades` armazena JSON opcional, sem reintroduzir classes removidas. |
| Hospedes da reserva | Classe atualizada `ReservaHospede`; ausente no DER v4 | Introduzir `tb_reserva_hospede`. |
| Mídia de hospedagem | Classe `MidiaHospedagem` nova | Introduzir `tb_midia_hospedagem`; fotos separadas em `tb_imagem_hospedagem` e `tb_foto_tipo_quarto`. |
| Pesquisa / filtros | Classes atualizadas | Introduzir `tb_pesquisa` e `tb_filtro_pesquisa` (comodidades JSON). |
| Ocorrências | DER foca guia; documento adicional cobre cliente/hotel/guia | `tb_ocorrencia.tipo_alvo` com FK para exatamente um destino. Punição aponta para ocorrência analisada e para administrador responsável. |
| Penalidade do guia | Classe possui flag `punido`, motivo e número OS | Histórico de `tb_penalidade` como fonte de verdade, evitando sincronização de flags. Número da ocorrência = `id_ocorrencia`; caso número OS externo seja obrigatório, adicionar na futura migração. |
| Status/histórico | DER possui tabelas de domínio + históricos | Preservar `tb_status_reserva`, `tb_status_pagamento`, `tb_status_mensagem`, `tb_reserva_status`, `tb_pagamento_status`. |
| Logs | DER prevê log geral e diversos logs específicos; RF32–RF34 | Preservar `tb_log` e 8 tabelas setoriais do DER. Logging em arquivo virá na Parte 2. |
| SAC/Ouvidoria | Requisitos RF23–RF31 e RF35 | `tb_atendimento`, `tb_mensagem`, `tb_atendimento_historico`; sem chave de IA nem integração nesta etapa. |

## Referências de requisito por tabela

| Domínio | Tabelas centrais | Requisitos |
|---|---|---|
| Cadastro e identidade | `tb_usuario`, `tb_endereco_usuario`, `tb_admin_hotel` | RF01, RF02, RN02, RNF04, RNF05 |
| Hospedagens e busca | `tb_hotel`, `tb_endereco`, `tb_tipo_quarto`, `tb_imagem_hospedagem`, `tb_pesquisa`, `tb_filtro_pesquisa` | RF03–RF08, RN03, RNF06 |
| Reservas e hóspedes | `tb_reserva`, `tb_item_reserva`, `tb_reserva_hospede`, `tb_reserva_status` | RF07–RF11 |
| Pagamentos | `tb_pagamento`, `tb_pagamento_status` | RF12–RF14, RN01, RNF07 |
| Guias e avaliações | `tb_guia`, `tb_reserva_guia`, `tb_avaliacao_guia` | RF15–RF19 |
| Ocorrências e punições | `tb_ocorrencia`, `tb_penalidade` | RF20–RF22, RN04 |
| Chatbot e SAC | `tb_atendimento`, `tb_mensagem`, `tb_atendimento_historico` | RF23–RF31, RF35 |
| Auditoria | `tb_log`, `tb_log_*` | RF32–RF34, RN06, RNF08, RNF14 |

## Restrições que não são resolvidas somente com DDL

O DDL garante tipagem, unicidade, referências e vários CHECKs; **não implementa os fluxos de negócio**.

1. O serviço deverá autorizar cada operação conforme perfil do usuário (não é assegurado por FK).
2. Regra de pagamento até sete dias antes do check-in deve ser checada antes/depois do callback externo (RN01/RF14).
3. O serviço deverá evitar overbooking com transações/locks e validação por intervalo (RN03/RNF06). `quantidade_disponivel` **não garante** a disponibilidade por data isoladamente.
4. O serviço deve conferir que o hotel referenciado por mídias de quarto corresponde ao hotel do quarto; são FKs separadas.
5. O serviço deve checar correspondência entre status atual e histórico e verificar que avaliadores são elegíveis.
6. A análise humana e a decisão PROCEDENTE devem ser conferidas antes de inserir penalidade.
7. `tb_log_mensagem` nunca deve capturar textos integrais em valores anterior/novo, mesmo tendo campos legados previstos no DER.
8. O banco não faz exclusão em cascata de dados transacionais/auditoria sensíveis; planejar retenção e exclusão conforme política de privacidade.

## Observação sobre dados demonstrativos

`02_seed.sql` insere identidades fictícias, com senhas bcrypt. Todos os pagamentos, avaliações e punições ali descritos são simulações acadêmicas e **não comprovam** que as integrações, regras de negócio ou fluxos estejam implementados. Endereços e links de fotos são exclusivamente ilustrativos.
