-- HospedJa | CodeSync | Checkpoint 3 | Parte 1
-- MySQL 8.0.16+ (CHECK efetivamente aplicado); InnoDB; UTF-8.
-- Execucao inicial: mysql -u root -p < database/01_schema.sql
-- Nao use DROP DATABASE automaticamente. Migracoes futuras devem preservar dados.
CREATE DATABASE IF NOT EXISTS hospedja CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE hospedja;

-- IDENTIDADES E PERFIS
CREATE TABLE IF NOT EXISTS tb_usuario (
  id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  cpf CHAR(11) NULL,
  telefone VARCHAR(20) NULL,
  data_nascimento DATE NULL,
  tipo_usuario ENUM('CLIENTE','ADMIN','OPERADOR_SAC','GESTOR_HOSPEDAGEM','GUIA') NOT NULL DEFAULT 'CLIENTE',
  status ENUM('ATIVO','INATIVO','BLOQUEADO') NOT NULL DEFAULT 'ATIVO',
  data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_email UNIQUE (email),
  CONSTRAINT uq_usuario_cpf UNIQUE (cpf),
  CONSTRAINT ck_usuario_email CHECK (email COLLATE utf8mb4_0900_as_cs = LOWER(email) COLLATE utf8mb4_0900_as_cs),
  CONSTRAINT ck_usuario_cpf CHECK (cpf IS NULL OR cpf REGEXP '^[0-9]{11}$')
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_endereco_usuario (
  id_endereco_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  cep CHAR(8) NOT NULL,
  logradouro VARCHAR(150) NOT NULL,
  numero VARCHAR(15) NOT NULL,
  complemento VARCHAR(80),
  bairro VARCHAR(80),
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,
  pais CHAR(2) NOT NULL DEFAULT 'BR',
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_endereco_usuario_usuario (id_usuario),
  CONSTRAINT ck_endereco_usuario_cep CHECK (cep REGEXP '^[0-9]{8}$'),
  CONSTRAINT fk_endereco_usuario_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- HOSPEDAGENS: tb_hotel no DER = Hospedagem no diagrama de classes.
CREATE TABLE IF NOT EXISTS tb_rede_hoteis (
  id_rede BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  logo_url VARCHAR(500),
  status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_hotel (
  id_hotel BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_rede BIGINT UNSIGNED NULL,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  comodidades JSON NULL,
  categoria ENUM('HOTEL','POUSADA','RESORT','APART_HOTEL','HOSTEL','OUTRO') NOT NULL DEFAULT 'HOTEL',
  classificacao TINYINT UNSIGNED NULL,
  telefone VARCHAR(20),
  email VARCHAR(190),
  checkin_inicio TIME NULL,
  checkout_fim TIME NULL,
  status ENUM('ATIVO','INATIVO','BLOQUEADO') NOT NULL DEFAULT 'ATIVO',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_hotel_rede (id_rede),
  INDEX ix_hotel_status_categoria (status,categoria),
  CONSTRAINT ck_hotel_classificacao CHECK (classificacao IS NULL OR classificacao BETWEEN 1 AND 5),
  CONSTRAINT fk_hotel_rede FOREIGN KEY (id_rede) REFERENCES tb_rede_hoteis(id_rede) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_endereco (
  id_endereco BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_hotel BIGINT UNSIGNED NOT NULL,
  rua VARCHAR(150) NOT NULL,
  numero VARCHAR(15) NOT NULL,
  complemento VARCHAR(80),
  bairro VARCHAR(100),
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  cep CHAR(8) NOT NULL,
  pais CHAR(2) NOT NULL DEFAULT 'BR',
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  CONSTRAINT uq_endereco_hotel UNIQUE (id_hotel),
  INDEX ix_endereco_cidade_estado (cidade,estado),
  CONSTRAINT ck_endereco_cep CHECK (cep REGEXP '^[0-9]{8}$'),
  CONSTRAINT ck_endereco_lat CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT ck_endereco_long CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CONSTRAINT fk_endereco_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_admin_hotel (
  id_admin_hotel BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_hotel BIGINT UNSIGNED NOT NULL,
  cnpj CHAR(14) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  data_ativacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_desativacao DATETIME NULL,
  CONSTRAINT uq_admin_hotel UNIQUE (id_usuario,id_hotel),
  INDEX ix_admin_hotel_hotel (id_hotel),
  CONSTRAINT ck_admin_hotel_cnpj CHECK (cnpj IS NULL OR cnpj REGEXP '^[0-9]{14}$'),
  CONSTRAINT fk_admin_hotel_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_admin_hotel_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_imagem_hospedagem (
  id_imagem BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_hotel BIGINT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  descricao VARCHAR(255),
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  ordem SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX ix_imagem_hotel (id_hotel,principal),
  CONSTRAINT fk_imagem_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_tipo_quarto (
  id_tipo_quarto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_hotel BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  descricao TEXT,
  capacidade SMALLINT UNSIGNED NOT NULL,
  quantidade_camas SMALLINT UNSIGNED NULL,
  tamanho_m2 DECIMAL(7,2) NULL,
  valor_diaria DECIMAL(12,2) NOT NULL,
  quantidade_disponivel SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('DISPONIVEL','INDISPONIVEL','MANUTENCAO') NOT NULL DEFAULT 'DISPONIVEL',
  INDEX ix_quarto_hotel (id_hotel,status),
  CONSTRAINT ck_quarto_capacidade CHECK (capacidade >= 1),
  CONSTRAINT ck_quarto_camas CHECK (quantidade_camas IS NULL OR quantidade_camas >= 1),
  CONSTRAINT ck_quarto_tamanho CHECK (tamanho_m2 IS NULL OR tamanho_m2 > 0),
  CONSTRAINT ck_quarto_preco CHECK (valor_diaria >= 0),
  CONSTRAINT fk_quarto_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_foto_tipo_quarto (
  id_foto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_tipo_quarto BIGINT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  legenda VARCHAR(150),
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  ordem SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  data_upload DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_foto_quarto (id_tipo_quarto,principal),
  CONSTRAINT fk_foto_quarto FOREIGN KEY (id_tipo_quarto) REFERENCES tb_tipo_quarto(id_tipo_quarto) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_midia_hospedagem (
  id_midia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_hotel BIGINT UNSIGNED NOT NULL,
  id_tipo_quarto BIGINT UNSIGNED NULL,
  url_youtube VARCHAR(500) NOT NULL,
  titulo VARCHAR(150),
  descricao TEXT,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_midia_hotel (id_hotel),
  CONSTRAINT fk_midia_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE CASCADE,
  CONSTRAINT fk_midia_quarto FOREIGN KEY (id_tipo_quarto) REFERENCES tb_tipo_quarto(id_tipo_quarto) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_favorito (
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_hotel BIGINT UNSIGNED NOT NULL,
  data_adicao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario,id_hotel),
  INDEX ix_favorito_hotel (id_hotel),
  CONSTRAINT fk_favorito_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_favorito_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE CASCADE
) ENGINE=InnoDB;

-- PESQUISAS E FILTROS (classes introduzidas no modelo atualizado)
CREATE TABLE IF NOT EXISTS tb_pesquisa (
  id_pesquisa BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NULL,
  destino VARCHAR(150) NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  hospedes SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  data_pesquisa DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_pesquisa_usuario_data (id_usuario,data_pesquisa),
  CONSTRAINT ck_pesquisa_datas CHECK (checkout > checkin),
  CONSTRAINT ck_pesquisa_hospedes CHECK (hospedes >= 1),
  CONSTRAINT fk_pesquisa_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_filtro_pesquisa (
  id_filtro BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pesquisa BIGINT UNSIGNED NOT NULL,
  regiao VARCHAR(150),
  preco_minimo DECIMAL(12,2),
  preco_maximo DECIMAL(12,2),
  avaliacao_minima DECIMAL(3,2),
  comodidades JSON NULL,
  ordenar_por ENUM('PRECO','AVALIACAO','DISTANCIA','POPULARIDADE') NULL,
  ordem ENUM('ASC','DESC') NOT NULL DEFAULT 'ASC',
  CONSTRAINT uq_filtro_pesquisa UNIQUE (id_pesquisa),
  CONSTRAINT ck_filtro_preco_min CHECK (preco_minimo IS NULL OR preco_minimo >= 0),
  CONSTRAINT ck_filtro_preco_max CHECK (preco_maximo IS NULL OR preco_maximo >= 0),
  CONSTRAINT ck_filtro_preco_ordem CHECK (preco_minimo IS NULL OR preco_maximo IS NULL OR preco_maximo >= preco_minimo),
  CONSTRAINT ck_filtro_avaliacao CHECK (avaliacao_minima IS NULL OR avaliacao_minima BETWEEN 1 AND 5),
  CONSTRAINT fk_filtro_pesquisa FOREIGN KEY (id_pesquisa) REFERENCES tb_pesquisa(id_pesquisa) ON DELETE CASCADE
) ENGINE=InnoDB;

-- GUIAS: identidade interna vinculada a usuario; externos podem ser listados sem login.
CREATE TABLE IF NOT EXISTS tb_guia (
  id_guia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NULL,
  id_hotel BIGINT UNSIGNED NULL,
  nome VARCHAR(120) NOT NULL,
  documento_identidade VARCHAR(35) NULL,
  email VARCHAR(190),
  telefone VARCHAR(20),
  tipo_guia ENUM('INTERNO','EXTERNO') NOT NULL,
  descricao TEXT,
  especialidade VARCHAR(150),
  area_atuacao VARCHAR(150),
  servicos_oferecidos TEXT,
  valor_diaria DECIMAL(12,2),
  status_aprovacao ENUM('PENDENTE','APROVADO','REPROVADO') NOT NULL DEFAULT 'PENDENTE',
  status ENUM('ATIVO','INATIVO','BLOQUEADO') NOT NULL DEFAULT 'ATIVO',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_guia_usuario UNIQUE (id_usuario),
  INDEX ix_guia_hotel (id_hotel),
  INDEX ix_guia_tipo_status (tipo_guia,status),
  CONSTRAINT ck_guia_valor CHECK (valor_diaria IS NULL OR valor_diaria >= 0),
  CONSTRAINT ck_guia_interno_usuario CHECK (tipo_guia <> 'INTERNO' OR id_usuario IS NOT NULL),
  CONSTRAINT fk_guia_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_guia_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE SET NULL
) ENGINE=InnoDB;

-- STATUS DE DOMINIO (tabelas do DER v4)
CREATE TABLE IF NOT EXISTS tb_status_reserva (
  id_status_reserva TINYINT UNSIGNED PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descricao VARCHAR(120) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_status_pagamento (
  id_status_pagamento TINYINT UNSIGNED PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descricao VARCHAR(120) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_status_mensagem (
  id_status_mensagem TINYINT UNSIGNED PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descricao VARCHAR(120) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- RESERVAS, HOSPEDES, ITENS, HISTORICOS E PAGAMENTOS
CREATE TABLE IF NOT EXISTS tb_reserva (
  id_reserva BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_status_reserva TINYINT UNSIGNED NOT NULL,
  codigo_confirmacao VARCHAR(40) NOT NULL,
  data_reserva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  quantidade_hospedes SMALLINT UNSIGNED NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  taxas DECIMAL(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  CONSTRAINT uq_reserva_codigo UNIQUE (codigo_confirmacao),
  INDEX ix_reserva_usuario_data (id_usuario,data_reserva),
  INDEX ix_reserva_status (id_status_reserva),
  INDEX ix_reserva_periodo (checkin,checkout),
  CONSTRAINT ck_reserva_datas CHECK (checkout > checkin),
  CONSTRAINT ck_reserva_hospedes CHECK (quantidade_hospedes >= 1),
  CONSTRAINT ck_reserva_valores CHECK (valor_total >= 0 AND taxas >= 0),
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_status FOREIGN KEY (id_status_reserva) REFERENCES tb_status_reserva(id_status_reserva) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_item_reserva (
  id_item_reserva BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  id_tipo_quarto BIGINT UNSIGNED NOT NULL,
  quantidade SMALLINT UNSIGNED NOT NULL,
  valor_diaria DECIMAL(12,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  CONSTRAINT uq_item_reserva_quarto UNIQUE (id_reserva,id_tipo_quarto),
  INDEX ix_item_tipo_quarto (id_tipo_quarto),
  CONSTRAINT ck_item_quantidade CHECK (quantidade >= 1),
  CONSTRAINT ck_item_valores CHECK (valor_diaria >= 0 AND valor_total >= 0),
  CONSTRAINT fk_item_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_item_quarto FOREIGN KEY (id_tipo_quarto) REFERENCES tb_tipo_quarto(id_tipo_quarto) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_reserva_hospede (
  id_reserva_hospede BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  documento VARCHAR(35) NULL,
  data_nascimento DATE NULL,
  INDEX ix_reserva_hospede_reserva (id_reserva),
  CONSTRAINT fk_reserva_hospede FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_reserva_status (
  id_reserva_status BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  id_status_reserva TINYINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  observacao VARCHAR(255),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_hist_reserva_data (id_reserva,data_hora),
  CONSTRAINT fk_hist_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_hist_reserva_status FOREIGN KEY (id_status_reserva) REFERENCES tb_status_reserva(id_status_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_hist_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_pagamento (
  id_pagamento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  id_status_pagamento TINYINT UNSIGNED NOT NULL,
  provedor ENUM('MERCADO_PAGO') NOT NULL DEFAULT 'MERCADO_PAGO',
  valor DECIMAL(12,2) NOT NULL,
  metodo ENUM('CARTAO_CREDITO','CARTAO_DEBITO','PIX','BOLETO') NULL,
  transacao_externa_id VARCHAR(120) NULL,
  data_pagamento DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_pagamento_transacao UNIQUE (transacao_externa_id),
  INDEX ix_pagamento_reserva (id_reserva),
  INDEX ix_pagamento_status (id_status_pagamento),
  CONSTRAINT ck_pagamento_valor CHECK (valor >= 0),
  CONSTRAINT fk_pagamento_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_pagamento_status FOREIGN KEY (id_status_pagamento) REFERENCES tb_status_pagamento(id_status_pagamento) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_pagamento_status (
  id_pagamento_status BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pagamento BIGINT UNSIGNED NOT NULL,
  id_status_pagamento TINYINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  observacao VARCHAR(255),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_hist_pagamento_data (id_pagamento,data_hora),
  CONSTRAINT fk_hist_pagamento FOREIGN KEY (id_pagamento) REFERENCES tb_pagamento(id_pagamento) ON DELETE RESTRICT,
  CONSTRAINT fk_hist_pagamento_status FOREIGN KEY (id_status_pagamento) REFERENCES tb_status_pagamento(id_status_pagamento) ON DELETE RESTRICT,
  CONSTRAINT fk_hist_pagamento_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_reserva_guia (
  id_reserva_guia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  id_guia BIGINT UNSIGNED NOT NULL,
  data_servico DATE NOT NULL,
  horario_inicio TIME NULL,
  horario_fim TIME NULL,
  valor DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PENDENTE','CONFIRMADA','CANCELADA','CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
  INDEX ix_reserva_guia_guia_data (id_guia,data_servico),
  CONSTRAINT ck_reserva_guia_valor CHECK (valor >= 0),
  CONSTRAINT ck_reserva_guia_horario CHECK (horario_inicio IS NULL OR horario_fim IS NULL OR horario_fim > horario_inicio),
  CONSTRAINT fk_reserva_guia_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_guia_guia FOREIGN KEY (id_guia) REFERENCES tb_guia(id_guia) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_avaliacao_guia (
  id_avaliacao BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva_guia BIGINT UNSIGNED NOT NULL,
  nota TINYINT UNSIGNED NOT NULL,
  comentario TEXT,
  data_avaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_avaliacao_guia_reserva UNIQUE (id_reserva_guia),
  CONSTRAINT ck_avaliacao_guia_nota CHECK (nota BETWEEN 1 AND 5),
  CONSTRAINT fk_avaliacao_guia_reserva FOREIGN KEY (id_reserva_guia) REFERENCES tb_reserva_guia(id_reserva_guia) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_avaliacao_hospedagem (
  id_avaliacao BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NOT NULL,
  nota TINYINT UNSIGNED NOT NULL,
  titulo VARCHAR(120),
  comentario TEXT,
  data_avaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_avaliacao_hotel_reserva UNIQUE (id_reserva),
  INDEX ix_avaliacao_hotel_usuario (id_usuario),
  CONSTRAINT ck_avaliacao_hotel_nota CHECK (nota BETWEEN 1 AND 5),
  CONSTRAINT fk_avaliacao_hotel_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_avaliacao_hotel_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- SAC / DEEPSEEK: somente estrutura de persistencia, sem integracao ativa.
CREATE TABLE IF NOT EXISTS tb_atendimento (
  id_atendimento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_operador BIGINT UNSIGNED NULL,
  id_reserva BIGINT UNSIGNED NULL,
  tipo ENUM('CHATBOT','SAC') NOT NULL DEFAULT 'CHATBOT',
  assunto VARCHAR(200),
  status ENUM('ABERTO','EM_ATENDIMENTO','AGUARDANDO_CLIENTE','ESCALONADO','RESOLVIDO','ENCERRADO') NOT NULL DEFAULT 'ABERTO',
  data_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_fim DATETIME NULL,
  INDEX ix_atendimento_usuario (id_usuario,status),
  INDEX ix_atendimento_operador (id_operador,status),
  INDEX ix_atendimento_reserva (id_reserva),
  CONSTRAINT ck_atendimento_fim CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT fk_atendimento_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_atendimento_operador FOREIGN KEY (id_operador) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL,
  CONSTRAINT fk_atendimento_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_mensagem (
  id_mensagem BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_atendimento BIGINT UNSIGNED NOT NULL,
  id_status_mensagem TINYINT UNSIGNED NOT NULL,
  remetente ENUM('CLIENTE','BOT','OPERADOR') NOT NULL,
  id_usuario_remetente BIGINT UNSIGNED NULL,
  conteudo TEXT NOT NULL,
  origem ENUM('WEB','SAC','DEEPSEEK') NOT NULL DEFAULT 'WEB',
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_mensagem_atendimento_data (id_atendimento,data_hora),
  CONSTRAINT fk_mensagem_atendimento FOREIGN KEY (id_atendimento) REFERENCES tb_atendimento(id_atendimento) ON DELETE RESTRICT,
  CONSTRAINT fk_mensagem_status FOREIGN KEY (id_status_mensagem) REFERENCES tb_status_mensagem(id_status_mensagem) ON DELETE RESTRICT,
  CONSTRAINT fk_mensagem_remetente FOREIGN KEY (id_usuario_remetente) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_atendimento_historico (
  id_historico BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_atendimento BIGINT UNSIGNED NOT NULL,
  id_usuario_ator BIGINT UNSIGNED NULL,
  status_anterior VARCHAR(30) NULL,
  status_novo VARCHAR(30) NOT NULL,
  observacao VARCHAR(255) NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_atendimento_hist_data (id_atendimento,data_hora),
  CONSTRAINT fk_atendimento_hist_atendimento FOREIGN KEY (id_atendimento) REFERENCES tb_atendimento(id_atendimento) ON DELETE RESTRICT,
  CONSTRAINT fk_atendimento_hist_ator FOREIGN KEY (id_usuario_ator) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- OCORRENCIAS PARA CLIENTES, HOTEIS E GUIAS (ampliacao do DER v4).
CREATE TABLE IF NOT EXISTS tb_ocorrencia (
  id_ocorrencia BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_reserva_guia BIGINT UNSIGNED NULL,
  id_reserva BIGINT UNSIGNED NULL,
  tipo_alvo ENUM('CLIENTE','HOTEL','GUIA') NOT NULL,
  id_usuario_alvo BIGINT UNSIGNED NULL,
  id_hotel_alvo BIGINT UNSIGNED NULL,
  id_guia_alvo BIGINT UNSIGNED NULL,
  tipo_ocorrencia VARCHAR(80) NOT NULL,
  descricao TEXT NOT NULL,
  analise TEXT NULL,
  id_usuario_analista BIGINT UNSIGNED NULL,
  data_analise DATETIME NULL,
  data_ocorrencia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('ABERTA','EM_ANALISE','PROCEDENTE','IMPROCEDENTE','ENCERRADA') NOT NULL DEFAULT 'ABERTA',
  INDEX ix_ocorrencia_status_data (status,data_ocorrencia),
  INDEX ix_ocorrencia_autor (id_usuario),
  INDEX ix_ocorrencia_alvo_usuario (id_usuario_alvo),
  INDEX ix_ocorrencia_alvo_hotel (id_hotel_alvo),
  INDEX ix_ocorrencia_alvo_guia (id_guia_alvo),
  CONSTRAINT ck_ocorrencia_alvo CHECK (
    (tipo_alvo='CLIENTE' AND id_usuario_alvo IS NOT NULL AND id_hotel_alvo IS NULL AND id_guia_alvo IS NULL)
    OR (tipo_alvo='HOTEL' AND id_usuario_alvo IS NULL AND id_hotel_alvo IS NOT NULL AND id_guia_alvo IS NULL)
    OR (tipo_alvo='GUIA' AND id_usuario_alvo IS NULL AND id_hotel_alvo IS NULL AND id_guia_alvo IS NOT NULL)
  ),
  CONSTRAINT fk_ocorrencia_autor FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_ocorrencia_reserva_guia FOREIGN KEY (id_reserva_guia) REFERENCES tb_reserva_guia(id_reserva_guia) ON DELETE SET NULL,
  CONSTRAINT fk_ocorrencia_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE SET NULL,
  CONSTRAINT fk_ocorrencia_usuario_alvo FOREIGN KEY (id_usuario_alvo) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_ocorrencia_hotel_alvo FOREIGN KEY (id_hotel_alvo) REFERENCES tb_hotel(id_hotel) ON DELETE RESTRICT,
  CONSTRAINT fk_ocorrencia_guia_alvo FOREIGN KEY (id_guia_alvo) REFERENCES tb_guia(id_guia) ON DELETE RESTRICT,
  CONSTRAINT fk_ocorrencia_analista FOREIGN KEY (id_usuario_analista) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_penalidade (
  id_penalidade BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ocorrencia BIGINT UNSIGNED NOT NULL,
  id_usuario_penalizador BIGINT UNSIGNED NOT NULL,
  tipo ENUM('ADVERTENCIA','SUSPENSAO_TEMPORARIA','BLOQUEIO') NOT NULL,
  descricao TEXT NOT NULL,
  data_aplicacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_fim_suspensao DATETIME NULL,
  status ENUM('ATIVA','CUMPRIDA','REVOGADA') NOT NULL DEFAULT 'ATIVA',
  INDEX ix_penalidade_ocorrencia (id_ocorrencia),
  INDEX ix_penalidade_responsavel (id_usuario_penalizador),
  CONSTRAINT ck_penalidade_data_fim CHECK (data_fim_suspensao IS NULL OR data_fim_suspensao >= data_aplicacao),
  CONSTRAINT fk_penalidade_ocorrencia FOREIGN KEY (id_ocorrencia) REFERENCES tb_ocorrencia(id_ocorrencia) ON DELETE RESTRICT,
  CONSTRAINT fk_penalidade_admin FOREIGN KEY (id_usuario_penalizador) REFERENCES tb_usuario(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;
-- Destinatario e identificado unicamente por tb_ocorrencia.tipo_alvo e *_alvo.
-- Backend exigira analise humana e decisao PROCEDENTE antes de inserir tb_penalidade.

-- LOG TRANSVERSAL: use detalhes sanitizados; jamais grave senha, token ou mensagem integral.
CREATE TABLE IF NOT EXISTS tb_log (
  id_log BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NULL,
  perfil VARCHAR(40) NULL,
  acao VARCHAR(100) NOT NULL,
  operacao VARCHAR(100) NULL,
  entidade VARCHAR(80) NULL,
  id_registro BIGINT UNSIGNED NULL,
  resultado ENUM('SUCESSO','FALHA','NEGADO') NOT NULL,
  origem VARCHAR(100) NOT NULL DEFAULT 'API',
  detalhes JSON NULL,
  ip VARCHAR(45) NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_usuario_data (id_usuario,data_hora),
  INDEX ix_log_entidade_registro (entidade,id_registro),
  INDEX ix_log_acao_data (acao,data_hora),
  CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Logs setoriais previstos explicitamente no DER v4 (dados nao sensiveis).
CREATE TABLE IF NOT EXISTS tb_log_rede_hotel (
  id_log_rede BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_rede BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_rede_data (id_rede,data_hora),
  CONSTRAINT fk_log_rede FOREIGN KEY (id_rede) REFERENCES tb_rede_hoteis(id_rede) ON DELETE RESTRICT,
  CONSTRAINT fk_log_rede_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_hotel (
  id_log_hotel BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_hotel BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_hotel_data (id_hotel,data_hora),
  CONSTRAINT fk_log_hotel FOREIGN KEY (id_hotel) REFERENCES tb_hotel(id_hotel) ON DELETE RESTRICT,
  CONSTRAINT fk_log_hotel_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_admin_hotel (
  id_log_admin_hotel BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_admin_hotel BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_admin_hotel_data (id_admin_hotel,data_hora),
  CONSTRAINT fk_log_admin_hotel FOREIGN KEY (id_admin_hotel) REFERENCES tb_admin_hotel(id_admin_hotel) ON DELETE RESTRICT,
  CONSTRAINT fk_log_admin_hotel_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_tipo_quarto (
  id_log_tipo_quarto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_tipo_quarto BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_quarto_data (id_tipo_quarto,data_hora),
  CONSTRAINT fk_log_quarto FOREIGN KEY (id_tipo_quarto) REFERENCES tb_tipo_quarto(id_tipo_quarto) ON DELETE RESTRICT,
  CONSTRAINT fk_log_quarto_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_reserva (
  id_log_reserva BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_reserva_data (id_reserva,data_hora),
  CONSTRAINT fk_log_reserva FOREIGN KEY (id_reserva) REFERENCES tb_reserva(id_reserva) ON DELETE RESTRICT,
  CONSTRAINT fk_log_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_pagamento (
  id_log_pagamento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pagamento BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_pagamento_data (id_pagamento,data_hora),
  CONSTRAINT fk_log_pagamento FOREIGN KEY (id_pagamento) REFERENCES tb_pagamento(id_pagamento) ON DELETE RESTRICT,
  CONSTRAINT fk_log_pagamento_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_mensagem (
  id_log_mensagem BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_mensagem BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_mensagem_data (id_mensagem,data_hora),
  CONSTRAINT fk_log_mensagem FOREIGN KEY (id_mensagem) REFERENCES tb_mensagem(id_mensagem) ON DELETE RESTRICT,
  CONSTRAINT fk_log_mensagem_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tb_log_penalidade (
  id_log_penalidade BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_penalidade BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED NULL,
  acao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  campo_alterado VARCHAR(60),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip VARCHAR(45),
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_log_penalidade_data (id_penalidade,data_hora),
  CONSTRAINT fk_log_penalidade FOREIGN KEY (id_penalidade) REFERENCES tb_penalidade(id_penalidade) ON DELETE RESTRICT,
  CONSTRAINT fk_log_penalidade_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;
