jest.mock('../../src/config/database', () => ({execute:jest.fn()}));
jest.mock('../../src/utils/logger', () => ({info:jest.fn(),error:jest.fn()}));
const pool = require('../../src/config/database');
const logger = require('../../src/utils/logger');
const audit = require('../../src/services/audit.service');
describe('TDD 4: log seguro', () => {
  beforeEach(()=>jest.clearAllMocks());
  test('salva auditoria na tabela tb_log sem corpo, token ou senha',async()=>{
    pool.execute.mockResolvedValue([{affectedRows:1}]);
    await audit.record({userId:12,profile:'CLIENTE',action:'AUTENTICACAO',operation:'POST',
      entity:'AUTH',result:'SUCESSO',ip:'127.0.0.1',details:{method:'POST',route:'/api/v1/auth/login',httpStatus:200,
      senha:'nao-persistir',token:'nao-persistir',body:{segredo:'nao-persistir'}}});
    const [statement,params]=pool.execute.mock.calls[0];
    expect(statement).toContain('INSERT INTO tb_log');
    expect(statement).toContain('VALUES (?,?,?,?,?,?,?');
    const serialized=JSON.stringify(params);
    expect(serialized).not.toContain('nao-persistir');
    expect(serialized).toContain('AUTENTICACAO');
    expect(logger.info).toHaveBeenCalledWith('audit_event',expect.objectContaining({http_status:200}));
  });
  test('falha de escrita e registrada no logger sem derrubar API',async()=>{
    pool.execute.mockRejectedValue({code:'ECONNREFUSED'});
    await expect(audit.record({action:'CADASTRO',result:'FALHA',details:{}})).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith('audit_database_failed',{code:'ECONNREFUSED'});
  });
});
