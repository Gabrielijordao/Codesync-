'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const source = path.join(__dirname,'..','src');
const files = [];
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{
  const full=path.join(dir,e.name);
  if(e.isDirectory())walk(full);else if(e.name.endsWith('.js'))files.push(full);
});
walk(source);
let failures=0;
for(const file of files){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0){failures++;console.error(result.stderr.trim());}
}
console.log(`Verificacao sintatica: ${files.length} arquivos, ${failures} erro(s).`);
process.exitCode=failures?1:0;
