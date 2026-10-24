const { hashPassword, verifyPassword, signToken, verifyToken } = require('../../src/utils/security');

describe('TDD 1: senhas bcrypt e JWT', () => {
  test('hash difere da senha, bcrypt 10+ e comparacao valida', async () => {
    const plain = 'Exemplo#Senha2026';
    const hashed = await hashPassword(plain);
    expect(hashed).not.toEqual(plain);
    expect(hashed).toMatch(/^\$2[aby]\$1[0-5]\$/);
    expect(await verifyPassword(plain, hashed)).toBe(true);
    expect(await verifyPassword('senha-incorreta', hashed)).toBe(false);
  });
  test('JWT valido contem somente sub e claims tecnicos, e token adulterado falha', () => {
    const token = signToken({id_usuario: 42, tipo_usuario: 'ADMIN'});
    const payload = verifyToken(token);
    expect(payload.sub).toBe('42');
    expect(payload).not.toHaveProperty('tipo_usuario');
    expect(() => verifyToken(token.slice(0,-4) + 'xxxx')).toThrow();
  });
});
