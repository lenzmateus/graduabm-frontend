# Handler 401: sempre redireciona, com `silenciar401` como porta de saída

Todo HTTP 401 disparado por `request()` em `api.js` agora limpa sessão, exibe toast (`"Sessão expirada. Faça login novamente."`) e redireciona pra `/login` ou `/admin-login` — não importa a mensagem do backend. Endpoints que esperam 401 como resposta legítima (credenciais inválidas em `Auth.login`, `Admin.Auth.login`, `Auth.cadastrar`) passam `silenciar401: true` em `opts` pra opt-out. A detecção admin-vs-aluno usa o JWT presente no `Authorization` header, não comparação string-com-string contra `sessionStorage.pbm_admin_jwt`.

## Considered Options

- **Manter o comportamento atual** (só `"Sessão encerrada"` desloga, outras mensagens 401 são arremessadas ao caller). Rejeitado: UX leak — JWT expirado deixava o aluno olhando "erro ao carregar" sem entender que precisava relogar.
- **Lista hardcoded de endpoints isentos do redirect** em `request()`. Rejeitado: vira lista mágica que ninguém atualiza. Opt-out explícito no call site (`silenciar401: true`) é auditável.

## Consequences

- A mensagem `"Sessão encerrada"` (vinda do backend quando `sessao_token` é invalidado por login simultâneo) continua existindo, mas agora é só um caso particular do default com toast levemente diferente: `"Sua sessão foi encerrada porque você fez login em outro dispositivo."`.
- `Auth.login`, `Auth.cadastrar` e `Admin.Auth.login` aplicam `silenciar401: true` automaticamente — não é responsabilidade do call site.
- Fica fechado o buraco em que admin com JWT inesperado no header não deslogava (a checagem `options.headers?.['Authorization'] === Bearer ${adminJwt}` era frágil).
