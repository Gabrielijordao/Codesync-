// RED — implementacao propositalmente incompleta: os quatro testes DEVEM falhar.
const incomplete=()=>{throw new Error('Ainda nao implementado (RED)');};
module.exports={createLab:()=>({hashPassword:incomplete,register:incomplete,login:incomplete,record:incomplete})};
