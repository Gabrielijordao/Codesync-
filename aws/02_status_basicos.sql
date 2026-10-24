-- Execute APENAS apos 01_schema.sql. NAO inclui usuarios ficticios.
USE hospedja;
INSERT INTO tb_status_reserva (id_status_reserva,codigo,descricao) VALUES
(1,'PENDENTE','Aguardando confirmacao'),(2,'CONFIRMADA','Reserva confirmada'),
(3,'CANCELADA','Reserva cancelada'),(4,'CONCLUIDA','Hospedagem concluida'),
(5,'NAO_COMPARECEU','Cliente nao compareceu')
ON DUPLICATE KEY UPDATE descricao=VALUES(descricao);
INSERT INTO tb_status_pagamento (id_status_pagamento,codigo,descricao) VALUES
(1,'PENDENTE','Aguardando pagamento'),(2,'APROVADO','Pagamento aprovado'),
(3,'RECUSADO','Pagamento recusado'),(4,'ESTORNADO','Pagamento devolvido'),
(5,'EXPIRADO','Prazo expirado')
ON DUPLICATE KEY UPDATE descricao=VALUES(descricao);
INSERT INTO tb_status_mensagem (id_status_mensagem,codigo,descricao) VALUES
(1,'ENVIADA','Mensagem registrada'),(2,'ENTREGUE','Mensagem entregue'),
(3,'FALHA','Falha no envio')
ON DUPLICATE KEY UPDATE descricao=VALUES(descricao);
