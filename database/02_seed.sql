-- HospedJa | CodeSync | CP3 | DADOS FICTICIOS DE DESENVOLVIMENTO
-- Somente em ambiente local/homologacao. NAO aplicar no banco AWS/producao.
-- Execute APOS 01_schema.sql em um banco novo. Senhas com hash bcrypt ($2b$, custo 10).
USE hospedja;
START TRANSACTION;

INSERT INTO tb_usuario (id_usuario,nome,email,senha_hash,cpf,telefone,tipo_usuario) VALUES
(1,'Cliente de Teste','cliente@hospedja.example','$2b$10$Qzxi5ub9TGxx8SqFA4B1KOOoUMK3jrwWBBxhrVa9K2pxVdTQf3Ckm',NULL,'34999990001','CLIENTE'),
(2,'Administrador de Teste','admin@hospedja.example','$2b$10$ECD0.fvixhLEjUaYqH4HWuhiRMEKUitxoBOnUzpb4PxBy5Yf3MZCS',NULL,'34999990002','ADMIN'),
(3,'Gestor de Teste','gestor@hospedja.example','$2b$10$NH4.cl3k7uC6MjbbMpOaYOqTkjZMQR24/WPgV8toymTkNPkXQO0Py',NULL,'34999990003','GESTOR_HOSPEDAGEM'),
(4,'Guia de Teste','guia@hospedja.example','$2b$10$Uc6nfrSLQAhZHR1bqkfzd./laetlicCOMxh00NElrC2r1IrjKJXeK',NULL,'34999990004','GUIA'),
(5,'Operador SAC de Teste','operador@hospedja.example','$2b$10$wWdlHfkDA2Zy/d2CdbgP5uhZhaNleOgHakfjZkXBOZKtCbyMyPkfe',NULL,'34999990005','OPERADOR_SAC');

INSERT INTO tb_endereco_usuario (id_endereco_usuario,id_usuario,cep,logradouro,numero,bairro,cidade,uf,principal) VALUES
(1,1,'38400001','Rua Exemplo','100','Centro','Uberlandia','MG',TRUE);

INSERT INTO tb_rede_hoteis (id_rede,nome,descricao) VALUES
(1,'Rede Academica Ficticia','Rede ficticia para demonstracao do Checkpoint 3');

INSERT INTO tb_hotel (id_hotel,id_rede,nome,descricao,categoria,classificacao,telefone,email,checkin_inicio,checkout_fim) VALUES
(1,1,'Hotel Escola Central','Hospedagem ficticia para testes da API.','HOTEL',4,'3430000100','contato@hotel-escola.example','14:00:00','12:00:00'),
(2,NULL,'Pousada Laboratorio','Pousada ficticia para testes.','POUSADA',3,'3430000200','contato@pousada-lab.example','15:00:00','11:00:00');

INSERT INTO tb_endereco (id_endereco,id_hotel,rua,numero,bairro,cidade,estado,cep,latitude,longitude) VALUES
(1,1,'Avenida Ilustrativa','50','Centro','Uberlandia','MG','38400002',-18.9182000,-48.2772000),
(2,2,'Rua das Amostras','20','Centro','Araxa','MG','38183001',-19.5902000,-46.9403000);

INSERT INTO tb_admin_hotel (id_admin_hotel,id_usuario,id_hotel,cnpj) VALUES
(1,3,1,NULL);

INSERT INTO tb_imagem_hospedagem (id_imagem,id_hotel,url,descricao,principal,ordem) VALUES
(1,1,'https://example.com/imagens/hotel-teste.jpg','Imagem demonstrativa nao hospedada',TRUE,0),
(2,2,'https://example.com/imagens/pousada-teste.jpg','Imagem demonstrativa nao hospedada',TRUE,0);

INSERT INTO tb_tipo_quarto (id_tipo_quarto,id_hotel,nome,tipo,descricao,capacidade,quantidade_camas,tamanho_m2,valor_diaria,quantidade_disponivel) VALUES
(1,1,'Quarto Duplo','STANDARD','Quarto ficticio com duas camas',2,2,25.00,240.00,8),
(2,1,'Suite Familiar','SUITE','Quarto ficticio para familia',4,3,45.00,420.00,4),
(3,2,'Quarto Casal','STANDARD','Quarto ficticio para duas pessoas',2,1,21.00,180.00,6);

INSERT INTO tb_foto_tipo_quarto (id_foto,id_tipo_quarto,url,legenda,principal) VALUES
(1,1,'https://example.com/imagens/quarto-duplo.jpg','Foto de demonstracao',TRUE),
(2,2,'https://example.com/imagens/suite-familiar.jpg','Foto de demonstracao',TRUE);

INSERT INTO tb_midia_hospedagem (id_midia,id_hotel,id_tipo_quarto,url_youtube,titulo) VALUES
(1,1,1,'https://www.youtube.com/watch?v=DEMO_VIDEO','Video ilustrativo; substituir por URL real');

INSERT INTO tb_favorito (id_usuario,id_hotel) VALUES (1,1);

INSERT INTO tb_pesquisa (id_pesquisa,id_usuario,destino,checkin,checkout,hospedes) VALUES
(1,1,'Uberlandia','2027-02-15','2027-02-18',2);
INSERT INTO tb_filtro_pesquisa (id_filtro,id_pesquisa,preco_minimo,preco_maximo,avaliacao_minima,comodidades,ordenar_por,ordem) VALUES
(1,1,100.00,500.00,3.00,JSON_ARRAY('Wi-Fi','Estacionamento'),'PRECO','ASC');

INSERT INTO tb_guia (id_guia,id_usuario,id_hotel,nome,email,telefone,tipo_guia,descricao,especialidade,area_atuacao,servicos_oferecidos,valor_diaria,status_aprovacao) VALUES
(1,4,1,'Guia Interno Ficticio','guia@hospedja.example','34999990004','INTERNO','Guia academico ficticio','Roteiros urbanos','Triangulo Mineiro','Passeios locais',150.00,'APROVADO'),
(2,NULL,NULL,'Guia Externo Ficticio','guiaexterno@exemplo.example','34999990009','EXTERNO','Contato externo de exemplo','Ecoturismo','Minas Gerais','Roteiro independente',180.00,'APROVADO');

INSERT INTO tb_status_reserva (id_status_reserva,codigo,descricao) VALUES
(1,'PENDENTE','Aguardando confirmacao'),
(2,'CONFIRMADA','Reserva confirmada'),
(3,'CANCELADA','Reserva cancelada'),
(4,'CONCLUIDA','Hospedagem concluida'),
(5,'NAO_COMPARECEU','Cliente nao compareceu');

INSERT INTO tb_status_pagamento (id_status_pagamento,codigo,descricao) VALUES
(1,'PENDENTE','Aguardando pagamento'),
(2,'APROVADO','Pagamento aprovado'),
(3,'RECUSADO','Pagamento recusado'),
(4,'ESTORNADO','Pagamento devolvido'),
(5,'EXPIRADO','Prazo expirado');

INSERT INTO tb_status_mensagem (id_status_mensagem,codigo,descricao) VALUES
(1,'ENVIADA','Mensagem registrada'),
(2,'ENTREGUE','Mensagem entregue'),
(3,'FALHA','Falha no envio');

INSERT INTO tb_reserva (id_reserva,id_usuario,id_status_reserva,codigo_confirmacao,checkin,checkout,quantidade_hospedes,valor_total,taxas,observacoes) VALUES
(1,1,2,'HJ-DEMO-0001','2027-02-15','2027-02-18',2,750.00,30.00,'Reserva ficticia confirmada; pagamento simulado'),
(2,1,1,'HJ-DEMO-0002','2027-03-10','2027-03-12',2,500.00,20.00,'Reserva ficticia pendente');

INSERT INTO tb_item_reserva (id_item_reserva,id_reserva,id_tipo_quarto,quantidade,valor_diaria,valor_total) VALUES
(1,1,1,1,240.00,720.00),
(2,2,1,1,240.00,480.00);

INSERT INTO tb_reserva_hospede (id_reserva_hospede,id_reserva,nome) VALUES
(1,1,'Hospede Ficticio A'),
(2,1,'Hospede Ficticio B');

INSERT INTO tb_reserva_status (id_reserva_status,id_reserva,id_status_reserva,id_usuario,observacao) VALUES
(1,1,1,1,'Reserva criada'),
(2,1,2,2,'Confirmacao simulada para testes'),
(3,2,1,1,'Reserva criada');

INSERT INTO tb_pagamento (id_pagamento,id_reserva,id_status_pagamento,valor,metodo,transacao_externa_id,data_pagamento) VALUES
(1,1,2,750.00,'PIX','DEMO-TRANSACAO-NAO-REAL-0001','2026-10-23 12:00:00'),
(2,2,1,500.00,'PIX',NULL,NULL);

INSERT INTO tb_pagamento_status (id_pagamento_status,id_pagamento,id_status_pagamento,id_usuario,observacao) VALUES
(1,1,1,1,'Pagamento pendente inicialmente'),
(2,1,2,2,'Aprovacao simulada; sem integracao Mercado Pago'),
(3,2,1,1,'Aguardando pagamento');

INSERT INTO tb_reserva_guia (id_reserva_guia,id_reserva,id_guia,data_servico,horario_inicio,horario_fim,valor,status) VALUES
(1,1,1,'2027-02-16','09:00:00','12:00:00',150.00,'CONFIRMADA');

-- Avaliacoes sao ficticias; o backend futuro devera validar elegibilidade real.
INSERT INTO tb_avaliacao_guia (id_avaliacao,id_reserva_guia,nota,comentario) VALUES
(1,1,5,'Avaliacao de demonstracao, sem servico real.');
INSERT INTO tb_avaliacao_hospedagem (id_avaliacao,id_reserva,id_usuario,nota,titulo,comentario) VALUES
(1,1,1,5,'Avaliacao ficticia','Somente para testes de persistencia.');

INSERT INTO tb_atendimento (id_atendimento,id_usuario,id_operador,id_reserva,tipo,assunto,status) VALUES
(1,1,NULL,1,'CHATBOT','Duvida sobre reserva','ABERTO'),
(2,1,5,1,'SAC','Solicitacao de atendimento humano','EM_ATENDIMENTO');

INSERT INTO tb_mensagem (id_mensagem,id_atendimento,id_status_mensagem,remetente,id_usuario_remetente,conteudo,origem) VALUES
(1,1,1,'CLIENTE',1,'Como consulto a minha reserva ficticia?','WEB'),
(2,1,1,'BOT',NULL,'Resposta ilustrativa sem chamada a API DeepSeek.','DEEPSEEK'),
(3,2,1,'OPERADOR',5,'Atendimento de demonstracao iniciado.','SAC');

INSERT INTO tb_atendimento_historico (id_historico,id_atendimento,id_usuario_ator,status_anterior,status_novo,observacao) VALUES
(1,1,1,NULL,'ABERTO','Abertura por cliente'),
(2,2,5,'ABERTO','EM_ATENDIMENTO','Atendimento assumido pelo operador');

INSERT INTO tb_ocorrencia (id_ocorrencia,id_usuario,id_reserva_guia,id_reserva,tipo_alvo,id_guia_alvo,tipo_ocorrencia,descricao,analise,id_usuario_analista,data_analise,status) VALUES
(1,1,1,1,'GUIA',1,'DESCUMPRIMENTO','Relato ficticio de descumprimento.','Caso ficticio revisado por administrador de teste.',2,'2026-10-23 12:30:00','PROCEDENTE');

INSERT INTO tb_penalidade (id_penalidade,id_ocorrencia,id_usuario_penalizador,tipo,descricao) VALUES
(1,1,2,'ADVERTENCIA','Advertencia exclusivamente ficticia, vinculada a analise humana simulada.');

INSERT INTO tb_log (id_log,id_usuario,perfil,acao,operacao,entidade,id_registro,resultado,origem,detalhes,ip) VALUES
(1,1,'CLIENTE','RESERVA_CRIADA','CREATE','RESERVA',1,'SUCESSO','API',JSON_OBJECT('ambiente','teste'),'127.0.0.1'),
(2,2,'ADMIN','OCORRENCIA_ANALISADA','UPDATE','OCORRENCIA',1,'SUCESSO','API',JSON_OBJECT('decisao','PROCEDENTE'),'127.0.0.1'),
(3,2,'ADMIN','PENALIDADE_APLICADA','CREATE','PENALIDADE',1,'SUCESSO','API',JSON_OBJECT('tipo','ADVERTENCIA'),'127.0.0.1');

INSERT INTO tb_log_reserva (id_log_reserva,id_reserva,id_usuario,acao,campo_alterado,valor_anterior,valor_novo,ip) VALUES
(1,1,1,'INSERT','id_status_reserva',NULL,'PENDENTE','127.0.0.1');
INSERT INTO tb_log_pagamento (id_log_pagamento,id_pagamento,id_usuario,acao,campo_alterado,valor_anterior,valor_novo,ip) VALUES
(1,1,2,'UPDATE','status','PENDENTE','APROVADO','127.0.0.1');
INSERT INTO tb_log_penalidade (id_log_penalidade,id_penalidade,id_usuario,acao,campo_alterado,valor_anterior,valor_novo,ip) VALUES
(1,1,2,'INSERT','tipo',NULL,'ADVERTENCIA','127.0.0.1');

COMMIT;
