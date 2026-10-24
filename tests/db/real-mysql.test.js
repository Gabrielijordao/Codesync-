/** Integração REAL: exija MySQL 8 com schema isolado, sem seed de produção. */
const request = require('supertest');
const pool = require('../../src/config/database');
const app = require('../../src/app');
const run = process.env.RUN_DB_TESTS === '1';
(run ? describe : describe.skip)('Integração real MySQL',()=>{
  afterAll(async()=> { await pool.end(); });
  test('health faz SELECT 1 no MySQL',async()=>{
    const r=await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({status:'ok'});
  });
  test('cadastro, login, persistencia bcrypt e auditoria',async()=>{
    const nonce=`tdd-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const email=`${nonce}@example.test`;
    const senha='TesteIntegracao#2026';
    let id;
    try {
      const reg=await request(app).post('/api/v1/auth/register').send({nome:'Teste Integracao',email,senha});
      expect(reg.status).toBe(201);
      id=reg.body.data.id_usuario;
      const [stored]=await pool.execute('SELECT senha_hash FROM tb_usuario WHERE id_usuario=?',[id]);
      expect(stored[0].senha_hash).toMatch(/^\$2[aby]\$/);
      expect(stored[0].senha_hash).not.toBe(senha);
      const login=await request(app).post('/api/v1/auth/login').send({email,senha});
      expect(login.status).toBe(200);
      expect(login.body.data.token).toBeTruthy();
      // Auditoria e assíncrona; consultas repetidas apenas neste teste.
      let logs=[];
      for (let i=0;i<10;i++) {
        [logs]=await pool.execute("SELECT acao FROM tb_log WHERE id_usuario=? AND acao IN ('CADASTRO','AUTENTICACAO')",[id]);
        if (logs.length>=2) break;
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      expect(logs.map(x=>x.acao)).toEqual(expect.arrayContaining(['CADASTRO','AUTENTICACAO']));
    } finally {
      if(id) { await pool.execute('DELETE FROM tb_log WHERE id_usuario=?',[id]); await pool.execute('DELETE FROM tb_usuario WHERE id_usuario=?',[id]); }
    }
  });
});
