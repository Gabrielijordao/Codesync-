'use strict';
const { z } = require('zod');
const required = (max = 150) => z.string().trim().min(1).max(max);
const optional = (max = 255) => z.string().trim().max(max).nullable().optional();
const bigintId = z.string().regex(/^[1-9]\d{0,19}$/, 'ID invalido');
const nonnegative = z.number().finite().nonnegative();
const positiveInt = z.number().int().positive();
const email = z.string().trim().toLowerCase().email().max(190);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  x => !Number.isNaN(Date.parse(`${x}T00:00:00Z`)) && new Date(`${x}T00:00:00Z`).toISOString().slice(0,10) === x,
  'Data invalida');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).nullable().optional();
const registration = z.object({
  nome: required(120), email,
  senha: z.string().min(10).max(72),
  telefone: optional(20),
  data_nascimento: date.nullable().optional()
}).strict();
const staffCreate = registration.extend({
  tipo_usuario: z.enum(['GUIA','GESTOR_HOSPEDAGEM','OPERADOR_SAC'])
}).strict();
const login = z.object({ email, senha: z.string().min(1).max(200) }).strict();
const profilePatch = z.object({
  nome: required(120).optional(), telefone: optional(20),
  data_nascimento: date.nullable().optional()
}).strict().refine(x => Object.keys(x).length > 0, 'Nenhuma alteracao enviada');
const passwordPatch = z.object({ atual: z.string().min(1), nova: z.string().min(10).max(72) }).strict();
const hotelCreate = z.object({
  id_rede: bigintId.nullable().optional(), nome: required(150), descricao: optional(20000),
  comodidades: z.array(required(80)).max(100).nullable().optional(),
  categoria: z.enum(['HOTEL','POUSADA','RESORT','APART_HOTEL','HOSTEL','OUTRO']).optional(),
  classificacao: z.number().int().min(1).max(5).nullable().optional(),
  telefone: optional(20), email: email.nullable().optional(),
  checkin_inicio: time, checkout_fim: time
}).strict();
const hotelPatch = hotelCreate.partial().extend({ status: z.enum(['ATIVO','INATIVO']).optional() }).strict();
const quartoCreate = z.object({
  id_hotel: bigintId, nome: required(120), tipo: required(80),
  descricao: optional(20000), capacidade: positiveInt.max(500),
  quantidade_camas: positiveInt.max(500).nullable().optional(),
  tamanho_m2: z.number().positive().nullable().optional(), valor_diaria: nonnegative,
  quantidade_disponivel: z.number().int().nonnegative().max(100000).optional(),
  status: z.enum(['DISPONIVEL','INDISPONIVEL','MANUTENCAO']).optional()
}).strict();
const quartoPatch = quartoCreate.omit({id_hotel: true}).partial().strict();
const guiaCreate = z.object({
  id_usuario: bigintId.nullable().optional(), id_hotel: bigintId.nullable().optional(),
  nome: required(120), documento_identidade: optional(35),
  email: email.nullable().optional(), telefone: optional(20),
  tipo_guia: z.enum(['INTERNO','EXTERNO']), descricao: optional(20000),
  especialidade: optional(150), area_atuacao: optional(150),
  servicos_oferecidos: optional(20000), valor_diaria: nonnegative.nullable().optional(),
  status_aprovacao: z.enum(['PENDENTE','APROVADO','REPROVADO']).optional(),
  status: z.enum(['ATIVO','INATIVO','BLOQUEADO']).optional()
}).strict();
const guiaPatch = guiaCreate.omit({ id_usuario: true, id_hotel: true, tipo_guia: true }).partial().strict();
const reservaCreate = z.object({
  checkin: date, checkout: date, quantidade_hospedes: positiveInt.max(100),
  observacoes: optional(2000)
}).strict().refine(x => x.checkout > x.checkin, 'Checkout deve ser posterior ao checkin');
const reservaPatch = z.object({ observacoes: optional(2000) }).strict();
const pagamentoCreate = z.object({
  id_reserva: bigintId, valor: nonnegative,
  metodo: z.enum(['CARTAO_CREDITO','CARTAO_DEBITO','PIX','BOLETO']).nullable().optional()
}).strict();
const occurrenceCreate = z.object({
  tipo_alvo: z.enum(['CLIENTE','HOTEL','GUIA']),
  id_alvo: bigintId, tipo_ocorrencia: required(80), descricao: required(5000),
  id_reserva: bigintId.nullable().optional(), id_reserva_guia: bigintId.nullable().optional()
}).strict();
const occurrenceReview = z.object({
  status: z.enum(['EM_ANALISE','PROCEDENTE','IMPROCEDENTE','ENCERRADA']),
  analise: required(5000)
}).strict();
module.exports = {
  bigintId, registration, staffCreate, login, profilePatch, passwordPatch,
  hotelCreate, hotelPatch, quartoCreate, quartoPatch,
  guiaCreate, guiaPatch, reservaCreate, reservaPatch,
  pagamentoCreate, occurrenceCreate, occurrenceReview
};
