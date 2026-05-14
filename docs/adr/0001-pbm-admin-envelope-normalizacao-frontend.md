# Interface `PBM.Admin`: envelope universal `{ itens, total }` com normalização no frontend

Toda função `listar()` em `PBM.Admin` devolve `{ itens, total }` (endpoints paginados acrescentam `pagina` e `totalPaginas`), mesmo quando o backend retorna array nu ou outro envelope. A tradução é feita **no `api.js`**, não no backend — `pagina`/`totalPaginas` são computados no wrapper (`pagina = params.pagina`, `totalPaginas = Math.ceil(total / porPagina)`). O contrato existe pra dar leverage ao módulo `ListaAdmin` (refactor #6), que precisa de uma única forma pra ler qualquer lista admin.

## Considered Options

- **Envelope só nos endpoints que paginam de verdade.** Rejeitado: forçaria `ListaAdmin` a detectar "isso é array? envelope?" e duplicar código por consumidor.
- **Tocar backend nas 13 rotas de admin pra padronizar payload.** Rejeitado: deploy Railway + risco backend sem ganho real — pros endpoints não paginados, `total = itens.length` é matematicamente correto e pode ser computado no frontend.
- **Sem retry mechanics.** Não há dor documentada hoje; quando virar dor, entra como decorator opt-in em `request()` sem mudar assinatura dos wrappers (`{ retry: { tentativas: 2, soPara: [502, 503, 504] } }`). GET com retry default; POST/PATCH/DELETE só com `retry: true` explícito.

## Consequences

- Interface frontend usa português (`pagina`, `porPagina`, `busca`); wrapper traduz pra `page`/`per_page` no fio. Consistente com o resto do payload do projeto (`usuario`, `alunos`, `vencimento`).
- Endpoints que hoje retornam array nu (cupons, admins, convites, legislações etc.) terão `{ itens, total }` mesmo sem necessidade real de paginação — overkill aparente, mas é o preço do contrato único.
