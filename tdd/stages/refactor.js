// REFACTOR — reutilizavel, estrutura de responsabilidades clara, comportamento mantido.
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const unauthorized=()=>{throw new Error('CREDENCIAIS_INVALIDAS');};
async function passwordHash(senha) {return bcrypt.hash(senha,10);}
async function passwordMatches(senha,hash) {return bcrypt.compare(senha,hash);}
function publicRecord(record) {const {senha_hash,...safe}=record;return safe;}
module.exports.createLab=({db,logger,secret})=>{
  async function register({nome,email,senha}){
    if(await db.find(email))throw new Error('EMAIL_CADASTRADO');
    const record=await db.insert({nome,email,senha_hash:await passwordHash(senha)});
    return publicRecord(record);
  }
  async function login({email,senha}){
    const user=await db.find(email);
    if(!user || !await passwordMatches(senha,user.senha_hash)) return unauthorized();
    return jwt.sign({sub:String(user.id_usuario)},secret,{algorithm:'HS256',expiresIn:'1h'});
  }
  async function record(event){
    const safe={action:event.action,userId:event.userId,httpStatus:event.httpStatus};
    return logger.save(safe);
  }
  return {hashPassword:passwordHash,register,login,record};
};
