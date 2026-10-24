'use strict';
// Primeira conta ADMIN criada SOMENTE por operador com acesso ao container.
// Nao e uma rota HTTP, nao armazena senhas padrao no repositorio.
const readline = require('readline');
const pool = require('../config/database');
const users = require('../repositories/user.repository');
const { hashPassword } = require('../utils/security');

function ask(question, hidden = false) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input:process.stdin, output:process.stdout, terminal:true });
    if (hidden) {
      rl.stdoutMuted = true;
      rl._writeToOutput = function (string) {
        if (this.stdoutMuted) {
          // Não ecoar caracteres de senha; pergunta foi escrita antes.
          if (string.includes('\n')) this.output.write('\n');
        } else this.output.write(string);
      };
      process.stdout.write(question);
      rl.question('', answer => {rl.close();resolve(answer);});
    } else {
      rl.question(question, answer => {rl.close();resolve(answer);});
    }
    rl.on('SIGINT', () => {rl.close();reject(new Error('Operacao cancelada'));});
  });
}
(async () => {
  if (!process.stdin.isTTY) throw new Error('Execute interativamente: docker exec -it hospedja-api node src/cli/bootstrap-admin.js');
  const email = (await ask('E-mail do administrador: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190)
    throw new Error('Email invalido');
  if (await users.byEmail(email)) throw new Error('Este email ja existe; nao alterar perfil implicitamente');
  const nome = (await ask('Nome do administrador: ')).trim();
  if (!nome || nome.length > 120) throw new Error('Nome invalido');
  const senha = await ask('Senha forte inicial (oculta): ',true);
  if (senha.length < 10 || senha.length > 72) throw new Error('Senha deve conter 10 a 72 caracteres');
  const id = await users.create({nome,email,senha_hash:await hashPassword(senha),tipo_usuario:'ADMIN'});
  process.stdout.write(`Conta administrativa criada com id ${id}. Altere a senha apos o primeiro login.\n`);
})().catch(e=>{
  process.stderr.write(`Bootstrap abortado: ${e.message}\n`);
  process.exitCode=1;
}).finally(async()=>{await pool.end();});
