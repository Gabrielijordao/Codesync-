jest.mock('../../src/repositories/user.repository');
const users = require('../../src/repositories/user.repository');
const auth = require('../../src/services/auth.service');
const { verifyPassword, verifyToken, hashPassword } = require('../../src/utils/security');

describe('TDD 2/3: cadastro, login e JWT', () => {
  beforeEach(() => jest.resetAllMocks());
  test('cadastra CLIENTE com senha hasheada e retorna perfil publico', async () => {
    users.byEmail.mockResolvedValue(null);
    users.create.mockResolvedValue('10');
    users.byId.mockResolvedValue({id_usuario:'10',nome:'Teste',email:'teste@example.com',tipo_usuario:'CLIENTE',status:'ATIVO'});
    const data = {nome:'Teste',email:'teste@example.com',senha:'Teste#Segura2026'};
    const result = await auth.register(data);
    const written = users.create.mock.calls[0][0];
    expect(written.tipo_usuario).toBe('CLIENTE');
    expect(written).not.toHaveProperty('senha');
    expect(await verifyPassword(data.senha,written.senha_hash)).toBe(true);
    expect(result).not.toHaveProperty('senha_hash');
  });
  test('nega email duplicado (409)', async () => {
    users.byEmail.mockResolvedValue({id_usuario:'7'});
    await expect(auth.register({email:'existente@example.com',senha:'Senha2026#',nome:'Pessoa'}))
      .rejects.toMatchObject({status:409,code:'EMAIL_CADASTRADO'});
    expect(users.create).not.toHaveBeenCalled();
  });
  test('login com senha correta entrega JWT sem hash', async () => {
    users.byEmail.mockResolvedValue({id_usuario:'10',senha_hash:await hashPassword('SenhaCerta#2026'),status:'ATIVO'});
    users.byId.mockResolvedValue({id_usuario:'10',tipo_usuario:'CLIENTE',status:'ATIVO'});
    const out = await auth.authenticate({email:'teste@example.com',senha:'SenhaCerta#2026'});
    expect(verifyToken(out.token).sub).toBe('10');
    expect(out.token_type).toBe('Bearer');
    expect(out.user).not.toHaveProperty('senha_hash');
  });
  test('login errado retorna 401 generico', async () => {
    users.byEmail.mockResolvedValue({id_usuario:'10',senha_hash:await hashPassword('SenhaCerta#2026'),status:'ATIVO'});
    await expect(auth.authenticate({email:'teste@example.com',senha:'errada'}))
      .rejects.toMatchObject({status:401,code:'CREDENCIAIS_INVALIDAS'});
  });
  test('nao autentica usuario inativo', async () => {
    users.byEmail.mockResolvedValue({id_usuario:'10',senha_hash:await hashPassword('SenhaCerta#2026'),status:'BLOQUEADO'});
    await expect(auth.authenticate({email:'teste@example.com',senha:'SenhaCerta#2026'}))
      .rejects.toMatchObject({status:401});
  });
  test('troca a senha com verificacao da anterior', async () => {
    users.byId.mockResolvedValue({id_usuario:'10',email:'teste@example.com'});
    users.byEmail.mockResolvedValue({senha_hash:await hashPassword('Anterior#2026')});
    await auth.changePassword('10',{atual:'Anterior#2026',nova:'Nova#Segura2026'});
    expect(await verifyPassword('Nova#Segura2026',users.update.mock.calls[0][1].senha_hash)).toBe(true);
  });
});
