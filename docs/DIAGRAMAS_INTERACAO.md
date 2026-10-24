# Diagramas de classes de interação - item 4.9

Todos os seis arquivos estão em `diagramas/`, são **editáveis no diagrams.net**, têm orientação vertical e fundo branco, sem notas internas. Os `.png` em `diagramas/previews/` são apenas pré-visualizações geradas separadamente.

1. `01_camadas_controller_service_repository.drawio`: rotas → controllers → services → repositories → MySQL.
2. `02_autenticacao_jwt_bcrypt.drawio`: AuthRoutes/AuthController/AuthService, middleware, utilitários de senha e token, usuário.
3. `03_auditoria_logs.drawio`: app, middleware, serviço de auditoria, Winston, persistência `tb_log`.
4. `04_reservas_pagamentos.drawio`: rascunhos de reserva, persistência e pagamento administrativo preliminar; **não representa integração real com Mercado Pago**.
5. `05_ocorrencias_analise.drawio`: registro, consulta e análise de ocorrência por administrador; **não implica punição automatizada**.
6. `06_componentes_atualizado_node.drawio`: substitui o desenho legado Java/Python pelo backend Node.js/Express realmente presente.

Ao apresentar, descreva como **visões propostas/implementadas no código** e evite afirmar que foram exercitadas com MySQL até existir evidência real.
