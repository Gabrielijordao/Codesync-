# Guia de colaboração - CodeSync

1. Abra uma issue descrita em `docs/DIVISAO_EQUIPE_E_BACKLOG.md`, escolha um responsável e confirme dependências.
2. Trabalhe em uma branch `feat/`, `fix/`, `test/`, `docs/`, `chore/` ou `ci/` a partir de `main`.
3. **Nunca commite `.env`, senhas, tokens, segredos AWS, dumps com usuários reais, `node_modules/` ou `coverage/`.**
4. Antes do Pull Request, execute `npm run check`, `npm run integrity`, `npm test` e, se alterar SQL, `npm run test:db` em MySQL isolado.
5. Registre no PR o comando executado e os resultados reais. Quando não executar, informe `não executado`.
6. PR exige outro integrante revisor e não deve incluir mudanças não relacionadas.
7. Commits semânticos: `feat(auth): criar rotas de login`, `fix(db): ajustar indice`, `test(reserva): cobrir cancelamento`, `docs(api): atualizar Swagger`.
8. Abra o diagrama no diagrams.net e salve em `.drawio` preservando layout vertical e fundo branco.

## Política de merges

Não aprovar uma PR sem testes da funcionalidade, sem revisão de segurança em módulos com dados pessoais, ou com divergência entre SQL e OpenAPI. Nunca assumir que a mera análise sintática comprova execução.
