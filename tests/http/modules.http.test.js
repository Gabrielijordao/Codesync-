const request=require('supertest');
const {signToken}=require('../../src/utils/security');
jest.mock('../../src/repositories/user.repository',()=>({byId:jest.fn()}));
jest.mock('../../src/services/audit.service',()=>({record:jest.fn(async()=>{})}));
jest.mock('../../src/services/reservation.service',()=>({list:jest.fn(),get:jest.fn(),create:jest.fn(),patch:jest.fn(),cancelPendingDraft:jest.fn()}));
jest.mock('../../src/services/payment.service',()=>({list:jest.fn(),get:jest.fn(),createInternal:jest.fn()}));
jest.mock('../../src/services/occurrence.service',()=>({list:jest.fn(),get:jest.fn(),create:jest.fn(),review:jest.fn()}));
const users=require('../../src/repositories/user.repository');
const payments=require('../../src/services/payment.service');
const occurrences=require('../../src/services/occurrence.service');
const reservations=require('../../src/services/reservation.service');
const app=require('../../src/app');
const client={id_usuario:'10',tipo_usuario:'CLIENTE',status:'ATIVO'};
const admin={id_usuario:'20',tipo_usuario:'ADMIN',status:'ATIVO'};
const header=u=>`Bearer ${signToken(u)}`;
beforeEach(()=>{
  jest.resetAllMocks();
  users.byId.mockImplementation(async id => String(id)==='20'?admin:client);
});
describe('Rotas e permissoes',()=>{
  test('cliente pode criar rascunho pendente validado',async()=>{
    reservations.create.mockResolvedValue({id_reserva:'1',status_codigo:'PENDENTE'});
    const r=await request(app).post('/api/v1/reservas').set('Authorization',header(client))
      .send({checkin:'2030-01-01',checkout:'2030-01-02',quantidade_hospedes:2});
    expect(r.status).toBe(201);
    expect(reservations.create).toHaveBeenCalledWith(client,expect.objectContaining({checkin:'2030-01-01'}));
  });
  test('nao permite check-out antes do check-in',async()=>{
    const r=await request(app).post('/api/v1/reservas').set('Authorization',header(client))
      .send({checkin:'2030-01-03',checkout:'2030-01-02',quantidade_hospedes:2});
    expect(r.status).toBe(422);
    expect(reservations.create).not.toHaveBeenCalled();
  });
  test('cliente nao cria pagamento; somente admin cria preliminar',async()=>{
    const input={id_reserva:'1',valor:100,metodo:'PIX'};
    const deny=await request(app).post('/api/v1/pagamentos').set('Authorization',header(client)).send(input);
    expect(deny.status).toBe(403);
    payments.createInternal.mockResolvedValue({id_pagamento:'5',status_codigo:'PENDENTE'});
    const ok=await request(app).post('/api/v1/pagamentos').set('Authorization',header(admin)).send(input);
    expect(ok.status).toBe(201);
  });
  test('apenas admin revisa ocorrencia',async()=>{
    occurrences.review.mockResolvedValue({id_ocorrencia:'4',status:'EM_ANALISE'});
    const input={status:'EM_ANALISE',analise:'Relato verificado por pessoa responsavel.'};
    expect((await request(app).patch('/api/v1/ocorrencias/4/analise').set('Authorization',header(client)).send(input)).status).toBe(403);
    expect((await request(app).patch('/api/v1/ocorrencias/4/analise').set('Authorization',header(admin)).send(input)).status).toBe(200);
  });
});
