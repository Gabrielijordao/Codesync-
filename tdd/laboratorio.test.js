/** Reconstituicao didatica reproduzivel; NAO e historico real de desenvolvimento. */
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const stage=process.env.TDD_STAGE||'refactor';
const {createLab}=require(`./stages/${stage}`);
function fixture(){
  const registros=new Map();const eventos=[];
  const db={
    find: async email=>registros.get(email)||null,
    insert:async rec=>{const novo={...rec,id_usuario:'1'};registros.set(novo.email,novo);return novo;}
  };
  const logger={save:async evento=>{eventos.push(evento);}};
  const secret='segredo_de_laboratorio_didatico_32_chars';
  return {app:createLab({db,logger,secret}),db,eventos,secret};
}
describe(`TDD demonstracao: ${stage.toUpperCase()}`,()=>{
  test('1 RED/GREEN/REFACTOR: hash bcrypt',async()=>{
    const {app}=fixture();const senha='SenhaSegura#2026';
    const hash=await app.hashPassword(senha);
    expect(hash).not.toBe(senha);
    expect(await bcrypt.compare(senha,hash)).toBe(true);
  });
  test('2 RED/GREEN/REFACTOR: cadastro sem senha exposta',async()=>{
    const {app,db}=fixture();
    const user=await app.register({nome:'Ana',email:'ana@example.test',senha:'SenhaSegura#2026'});
    expect(user).toMatchObject({email:'ana@example.test'});
    expect(user).not.toHaveProperty('senha_hash');
    expect((await db.find('ana@example.test')).senha_hash).toMatch(/^\$2/);
  });
  test('3 RED/GREEN/REFACTOR: login cria JWT verificavel',async()=>{
    const {app,secret}=fixture();
    await app.register({nome:'Ana',email:'ana@example.test',senha:'SenhaSegura#2026'});
    const token=await app.login({email:'ana@example.test',senha:'SenhaSegura#2026'});
    expect(jwt.verify(token,secret).sub).toBe('1');
  });
  test('4 RED/GREEN/REFACTOR: log sem senha/token',async()=>{
    const {app,eventos}=fixture();
    await app.record({action:'AUTENTICACAO',userId:'1',httpStatus:200,senha:'jamais_gravar',token:'jamais_gravar'});
    expect(eventos).toHaveLength(1);
    expect(eventos[0].action).toBe('AUTENTICACAO');
    expect(JSON.stringify(eventos)).not.toContain('jamais_gravar');
  });
});
