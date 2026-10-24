-- Consulte APOS 01_schema.sql e 02_seed.sql.
USE hospedja;
SELECT COUNT(*) AS total_tabelas FROM information_schema.tables
 WHERE table_schema='hospedja' AND table_type='BASE TABLE';
SELECT COUNT(*) AS total_chaves_estrangeiras FROM information_schema.table_constraints
 WHERE table_schema='hospedja' AND constraint_type='FOREIGN KEY';
SELECT 'usuarios' AS entidade, COUNT(*) AS total FROM tb_usuario
UNION ALL SELECT 'hoteis', COUNT(*) FROM tb_hotel
UNION ALL SELECT 'quartos', COUNT(*) FROM tb_tipo_quarto
UNION ALL SELECT 'guias', COUNT(*) FROM tb_guia
UNION ALL SELECT 'reservas', COUNT(*) FROM tb_reserva
UNION ALL SELECT 'pagamentos', COUNT(*) FROM tb_pagamento
UNION ALL SELECT 'atendimentos', COUNT(*) FROM tb_atendimento
UNION ALL SELECT 'ocorrencias', COUNT(*) FROM tb_ocorrencia
UNION ALL SELECT 'penalidades', COUNT(*) FROM tb_penalidade
UNION ALL SELECT 'logs', COUNT(*) FROM tb_log;

SELECT r.codigo_confirmacao, u.email, s.codigo AS status_reserva,
       h.nome AS hospedagem, q.nome AS quarto, r.checkin, r.checkout
FROM tb_reserva r
JOIN tb_usuario u ON u.id_usuario=r.id_usuario
JOIN tb_status_reserva s ON s.id_status_reserva=r.id_status_reserva
JOIN tb_item_reserva i ON i.id_reserva=r.id_reserva
JOIN tb_tipo_quarto q ON q.id_tipo_quarto=i.id_tipo_quarto
JOIN tb_hotel h ON h.id_hotel=q.id_hotel
ORDER BY r.id_reserva;

SELECT o.id_ocorrencia, o.tipo_alvo, o.status, p.tipo AS punicao,
       a.nome AS responsavel
FROM tb_ocorrencia o
LEFT JOIN tb_penalidade p ON p.id_ocorrencia=o.id_ocorrencia
LEFT JOIN tb_usuario a ON a.id_usuario=o.id_usuario_analista;
