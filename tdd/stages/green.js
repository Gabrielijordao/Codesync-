// GREEN — funcionalidade minima para passar aos quatro casos.
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
module.exports.createLab=({db,logger,secret})=>({
  hashPassword:senha=>bcrypt.hash(senha,10),
  async register({nome,email,senha}){
    if(await db.find(email))throw new Error('EMAIL_CADASTRADO');
    const senha_hash=await bcrypt.hash(senha,10);
    const {senha_hash:ignored,...publico}=await db.insert({nome,email,senha_hash});
    return publico;
  },
  async login({email,senha}){
    const u=await db.find(email);
    if(!u||!(await bcrypt.compare(senha,u.senha_hash)))throw new Error('CREDENCIAIS_INVALIDAS');
    return jwt.sign({sub:String(u.id_usuario)},secret,{expiresIn:'1h'});
  },
  async record(info){
    await logger.save({action:info.action,userId:info.userId,httpStatus:info.httpStatus});
  }
});
