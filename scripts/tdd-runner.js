const {spawnSync}=require('child_process');
const path=require('path');
const stage=process.argv[2];
if(!['red','green','refactor'].includes(stage)) { console.error('Use: node scripts/tdd-runner.js red|green|refactor');process.exit(2); }
const binary=path.join(__dirname,'../node_modules/jest/bin/jest.js');
const r=spawnSync(process.execPath,[binary,'--runInBand','--config','jest.tdd.config.cjs'],{
  cwd:path.resolve(__dirname,'..'),stdio:'inherit',env:{...process.env,TDD_STAGE:stage}});
process.exit(r.status ?? 1);
