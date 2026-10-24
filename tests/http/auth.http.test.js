const request = require('supertest');
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/audit.service', () => ({record:jest.fn(async()=>{})}));
const users = require('../../src/repositories/user.repository');
const audit = require('../../src/services/audit.service');
const {verifyToken} = require('../../src/utils/security');
const app = require('../../src/app');
const db = new Map();
let nextId = 100;

beforeEach(() => {
  jest.clearAllMocks(); db.clear(); nextId=100;
  users.byEmail.mockImplementation(async email => db.get(email)||null);
  users.byId.mockImplementation(async id => {
    const u=[...db.values()].find(x=>String(x.id_usuario)===String(id));
    if (!u) return null;
    const {senha_hash,...safe}=u;
    return safe;
  });
  users.create.mockImplementation(async data => {
    const id=String(++nextId);
    db.set(data.email,{...data,id_usuario:id,status:'ATIVO'});
    return id;
  });
});
const payload={nome:'Aluno Exemplo',email:'aluno.tdd@example.com',senha:'Aluno#Senha2026'};
async function register() {return request(app).post('/api/v1/auth/register').send(payload);}

describe('API HTTP (Supertest, repositorio simulado)',()=>{
  test('POST register => 201, sem senha ou hash na resposta',async()=>{
    const r=await register();
    expect(r.status).toBe(201);
    expect(r.body.data.email).toBe(payload.email);
    expect(JSON.stringify(r.body)).not.toMatch(/senha|senha_hash|Aluno#Senha2026/);
  });
  test('POST register invalido => 422',async()=>{
    const r=await request(app).post('/api/v1/auth/register').send({nome:'X',email:'incorreto',senha:'curta'});
    expect(r.status).toBe(422);
    expect(r.body.error.code).toBe('DADOS_INVALIDOS');
  });
  test('cadastro duplicado => 409',async()=>{
    expect((await register()).status).toBe(201);
    expect((await register()).status).toBe(409);
  });
  test('login valido retorna JWT e /usuarios/me exige Bearer',async()=>{
    await register();
    expect((await request(app).get('/api/v1/usuarios/me')).status).toBe(401);
    const r=await request(app).post('/api/v1/auth/login').send({email:payload.email,senha:payload.senha});
    expect(r.status).toBe(200);
    expect(verifyToken(r.body.data.token).sub).toBe('101');
    const me=await request(app).get('/api/v1/usuarios/me').set('Authorization',`Bearer ${r.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(payload.email);
  });
  test('login incorreto => 401',async()=>{
    await register();
    const r=await request(app).post('/api/v1/auth/login').send({email:payload.email,senha:'errada'});
    expect(r.status).toBe(401);
    expect(r.body.error.code).toBe('CREDENCIAIS_INVALIDAS');
  });
  test('token alterado => 401 e perfil cliente nao administra usuarios',async()=>{
    await register();
    const r=await request(app).post('/api/v1/auth/login').send({email:payload.email,senha:payload.senha});
    const jwt=r.body.data.token;
    expect((await request(app).get('/api/v1/usuarios/me').set('Authorization',`Bearer ${jwt.split('.').slice(0,2).join('.')}.INVALIDA`)).status).toBe(401);
    expect((await request(app).get('/api/v1/usuarios').set('Authorization',`Bearer ${jwt}`)).status).toBe(403);
  });
  test('login e registro enviam evento de auditoria sem corpo da requisicao',async()=>{
    await register();
    await request(app).post('/api/v1/auth/login').send({email:payload.email,senha:payload.senha});
    await new Promise(resolve=>setImmediate(resolve));
    const events=audit.record.mock.calls.map(x=>x[0]);
    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({action:'CADASTRO',result:'SUCESSO'}),
      expect.objectContaining({action:'AUTENTICACAO',result:'SUCESSO'})]));
    expect(JSON.stringify(events)).not.toContain(payload.senha);
  });
  test('rota nao encontrada => 404 padronizado',async()=>{
    const r=await request(app).get('/api/v1/inexistente');
    expect(r.status).toBe(404);
    expect(r.body.error.code).toBe('ROTA_NAO_ENCONTRADA');
  });
});
