'use strict';
// Checagem estatica sem instalar dependencias (nao substitui Jest/Supertest).
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const src=path.join(root,'src');
const schema=fs.readFileSync(path.join(root,'database/01_schema.sql'),'utf8');
const tables=new Set([...schema.matchAll(/CREATE TABLE IF NOT EXISTS\s+(tb_[a-z0-9_]+)/ig)].map(m=>m[1]));
let refs=0,checked=0,errors=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const f=path.join(dir,e.name);
  if(e.isDirectory())walk(f);
  else if(f.endsWith('.js')){
    checked++;
    const contents=fs.readFileSync(f,'utf8');
    for(const m of contents.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)){
      refs++;
      const target=path.resolve(path.dirname(f),m[1]);
      if(!fs.existsSync(target+'.js') && !fs.existsSync(path.join(target,'index.js')))
        errors.push(`Import inexistente: ${path.relative(root,f)} -> ${m[1]}`);
    }
  }
}}
walk(src);
const core=['tb_usuario','tb_hotel','tb_tipo_quarto','tb_guia','tb_reserva','tb_pagamento','tb_ocorrencia','tb_log','tb_reserva_status','tb_pagamento_status'];
for(const table of core)if(!tables.has(table))errors.push('Tabela faltando no schema: '+table);
console.log(`Integridade: ${checked} modulos; ${refs} imports relativos; ${tables.size} tabelas; ${errors.length} problemas.`);
errors.forEach(e=>console.error(e));
if(errors.length)process.exitCode=1;
