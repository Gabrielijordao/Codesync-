# Matriz de rastreabilidade - documento técnico do Checkpoint 2

**Origem:** tabela de requisitos do arquivo `referencias/checkpoint2/HospedJa_Documento_Tecnico_Completo (1).docx`.

**Legenda:** Implementação inicial = endpoint/código presente, ainda sem teste funcional comprovado; Parcial = apenas parte do requisito; Pendente = sem implementação suficiente.

| ID | Descrição do requisito no CP2 | Estado | Evidência ou lacuna |
|---|---|---|---|
| RF01 | Permitir cadastro de clientes. | Implementação inicial | POST /api/v1/auth/register |
| RF02 | Permitir login e autenticação de usuários. | Implementação inicial | POST /api/v1/auth/login; JWT |
| RF03 | Permitir pesquisa de hospedagens por destino, datas e quantidade de hóspedes. | Pendente | Pesquisa por destino/datas/hóspedes |
| RF04 | Listar hospedagens compatíveis com os critérios de pesquisa. | Parcial | Listagem de hotéis, sem mecanismo de pesquisa |
| RF05 | Exibir detalhes das hospedagens, incluindo informações, comodidades, localização, fotos e valores. | Parcial | GET /hoteis/:id, sem endereço/fotos agregados |
| RF06 | Permitir consultar quartos disponíveis e seus detalhes. | Parcial | GET /quartos; sem checagem por período |
| RF07 | Verificar disponibilidade do quarto antes da confirmação da reserva. | Pendente | Disponibilidade por datas e controle de inventário |
| RF08 | Permitir selecionar quarto e calcular o valor da reserva. | Pendente | Seleção de quarto e cálculo de valor |
| RF09 | Permitir confirmar reservas antecipadas. | Pendente | Somente rascunho de reserva PENDENTE |
| RF10 | Permitir consultar reservas realizadas. | Implementação inicial | GET /reservas e GET /reservas/:id |
| RF11 | Permitir cancelar reservas conforme as regras definidas. | Parcial | Somente cancelamento de rascunho sem pagamento |
| RF12 | Integrar o pagamento da reserva ao Mercado Pago. | Pendente | Mercado Pago não integrado |
| RF13 | Registrar e consultar o status do pagamento. | Parcial | Persistência e leitura de status; sem confirmação real |
| RF14 | Controlar a regra de pagamento de até 7 dias antes da chegada. | Pendente | Regra de sete dias não aplicada no fluxo definitivo |
| RF15 | Permitir pesquisar guias. | Parcial | Listagem de guias, sem filtros especializados |
| RF16 | Permitir consultar guias internos e externos. | Implementação inicial | GET /guias com visão pública limitada |
| RF17 | Permitir reservar guia interno. | Pendente | Reserva de guia interno |
| RF18 | Permitir acessar informações e entrar em contato com guia externo. | Parcial | Dados cadastrais básicos do guia externo |
| RF19 | Permitir avaliar guias após a utilização do serviço. | Pendente | Avaliação de guia por API |
| RF20 | Permitir registrar ocorrências relacionadas aos guias. | Implementação inicial | POST /ocorrencias para diferentes alvos |
| RF21 | Permitir ao administrador analisar ocorrências. | Implementação inicial | PATCH /ocorrencias/:id/analise, ADMIN |
| RF22 | Permitir ao administrador aplicar penalidades a guias quando cabível. | Pendente | Sem endpoint de aplicar penalidade |
| RF23 | Disponibilizar SAC/Chatbot ao cliente autenticado. | Pendente | Persistência SAC prevista apenas no banco |
| RF24 | Permitir envio de mensagens ao chatbot. | Pendente | Sem API de mensagens do chatbot |
| RF25 | Enviar as mensagens do chatbot à API DeepSeek para processamento. | Pendente | Sem integração com DeepSeek |
| RF26 | Apresentar respostas automatizadas geradas pelo serviço de IA. | Pendente | Sem respostas geradas por IA |
| RF27 | Permitir encaminhar uma solicitação para atendimento humano quando necessário. | Pendente | Sem encaminhamento a atendimento humano |
| RF28 | Permitir ao operador de SAC/Ouvidoria visualizar e acompanhar solicitações de atendimento. | Pendente | Sem rotas do operador SAC |
| RF29 | Permitir ao operador de SAC/Ouvidoria registrar interações, encaminhamentos, respostas e encerramento de atendimentos. | Pendente | Sem gerenciamento de atendimento |
| RF30 | Permitir ao operador de SAC/Ouvidoria consultar informações da reserva e do atendimento necessárias para tratar a solicitação, respeitando suas permissões. | Pendente | Sem consulta SAC baseada em permissão |
| RF31 | Permitir ao operador de SAC/Ouvidoria sinalizar uma solicitação como escalonada para outro responsável quando necessário. | Pendente | Sem rota de escalonamento |
| RF32 | Registrar logs das ações relevantes realizadas no sistema. | Implementação inicial | Middleware com gravação em tb_log e Winston |
| RF33 | Associar os registros de log ao usuário, operação, data e horário correspondentes. | Parcial | Grava usuário/operação/timestamp/IP; persistência de auditoria não é garantida |
| RF34 | Registrar eventos relevantes das interações com o SAC/Chatbot para rastreabilidade. | Pendente | Sem integração ativa de eventos SAC |
| RF35 | Permitir controle do histórico das solicitações de atendimento. | Pendente | Histórico no banco sem API de atendimento |

## Requisitos não funcionais identificados no CP2

A conformidade com RNF depende de medição, inspeção e testes; a simples existência de código não é prova.

| ID | Descrição original |
|---|---|
| RNF01 | Usabilidade: a interface deverá ser clara, intuitiva e consistente. |
| RNF02 | Responsividade: as telas deverão se adaptar a diferentes tamanhos de tela. |
| RNF03 | Desempenho: as principais operações deverão apresentar tempo de resposta adequado. |
| RNF04 | Segurança: funcionalidades restritas deverão exigir autenticação e autorização adequadas. |
| RNF05 | Proteção de dados: dados pessoais e credenciais deverão ser armazenados de forma segura. |
| RNF06 | Integridade: reservas e disponibilidade de quartos deverão manter consistência e evitar conflitos. |
| RNF07 | Integrações seguras: comunicação com Mercado Pago e DeepSeek deverá utilizar mecanismos seguros de transporte e autenticação. |
| RNF08 | Rastreabilidade: ações relevantes deverão ser registradas em logs. |
| RNF09 | Manutenibilidade: o software deverá ser organizado de forma modular e documentada. |
| RNF10 | Confiabilidade: falhas de integrações externas deverão ser tratadas sem comprometer a consistência dos dados internos. |
| RNF11 | Disponibilidade: o sistema deverá permanecer acessível durante as janelas previstas de operação. |
| RNF12 | Mensagens de erro: o sistema deverá fornecer mensagens claras sem expor informações sensíveis. |
| RNF13 | Privacidade: o sistema deverá coletar e armazenar somente dados necessários às finalidades previstas. |
| RNF14 | Auditoria: registros de logs deverão possuir informações suficientes para investigação de operações e incidentes. |

## Regras principais

RN01: limite de sete dias para pagamento; RN02: autenticação obrigatória; RN03: disponibilidade; RN04: análise humana antes de punições; RN05: API DeepSeek; RN06: logs. Verificar implementação antes de declarar qualquer regra atendida.
