# Skills por Capítulo / Módulo / Parte — `leg/_caps/`

Pastas aqui contêm **especialistas-auditores** focados em **um capítulo, módulo ou parte** de uma leg cujo `.md` original é extenso demais para um agente único auditar com precisão.

> Estas skills **não entram no manifest**. O auditor de manifest (`scripts/auditar-skills.js`) ignora subdiretórios — só valida `.md` no root de `leg/`.

## Quando criar uma skill por capítulo

- A leg tem múltiplos capítulos/módulos/seções independentes
- Um agente único que lê o `.md` da leg tende a errar o recorte (subdimensiona ou superdimensiona)
- Histórico: o agente de `manual-combate-cbmmg` excluiu erroneamente questões sobre carboxiemoglobina/CO e NR-6 marcando-as como fora do escopo — ambas DENTRO do Cap. 2 (2026-05-21)

## Estrutura

```
leg/_caps/
├── manual-combate-cbmmg/
│   ├── cap01.md  (Fundamentos e Comportamento do Fogo)
│   ├── cap02.md  (EPI/EPR)
│   ├── cap03.md  (Materiais Básicos)
│   ├── cap05.md  (Técnicas de Combate)
│   └── cap07.md  (Entradas Forçadas)
├── ito23-aph/
│   ├── mod100.md  (Avaliação do Paciente)
│   ├── mod200.md  (Suporte Básico de Vida)
│   └── mod500.md  (Emergências Traumáticas)
└── ito34-salvamento-veicular/
    ├── parteA-fundamentos.md       (secs 1–7)
    ├── parteB-organizacao.md        (secs 8–15)
    └── parteC-desencarceramento.md  (secs 16–19)
```

> **Estado em 2026-06-01:** **todas as legs extensas** (fonte ≥ ~1.000 linhas ou
> `meta_questoes` ≥ 15) estão fatiadas — 29 diretórios de caps. Além das 3 acima:
> AT1 — `lei14376-13`, `dec51803-14`, `rt05-p02/p04a/p04b/p04c/p07/p11/p31`,
> `rt11-p01`, `rt12-2021`, `rt15-p01-2023`, `sol-cbmrs-2022`; AT4 — `lc10990-97`,
> `cpm-dec1001-69`, `cppm-dec73866-74`, `dec43245-04-rdbm`; AT5 — `ir001-1-cons-disciplina`,
> `ir003-1-padm`, `ir003-adm-exc20`, `ir006-sindicancia`, `caderno-abm-2023`,
> `it09-sci`, `portaria-018-24`, `lei6196-71`; AT3 — `it010-busca-salvamento`.

## Formato dos arquivos

Frontmatter obrigatório:
```yaml
---
parent_leg: <manifest_id da leg>
capitulo|modulo|parte: <identificador>
titulo: <título humano>
fonte: <path + intervalo de linhas OU de artigos/itens>
area_tematica: <AT1..AT5  OU  {"ctsp":"AT4","cba":"AT5"} p/ legs compartilhadas>
curso: <ctsp|cba|ambos>
---
```

Corpo:
1. **Sumário oficial** da seção (tabela)
2. **DENTRO** — lista explícita do que está coberto, com termos-chave
3. **FORA** — para onde encaminhar temas vizinhos (outro cap/módulo/parte; outra leg)
4. **Antes de decidir um veredicto** — regra de decisão + critério estreito de EXCLUIR

## Como usar na auditoria

Ao disparar um subagente auditor para um lote de questões, **aponte ele ao arquivo do capítulo certo** (em vez do `leg/{id}.md` genérico). O agente lê APENAS aquele capítulo e nada mais.

Para enxergar todas as questões de uma leg de uma vez, fatie o batch por capítulo (usando `topicos_cobertos` ou inspeção manual do enunciado) e dispare um agente por capítulo.

## Uso na geração (caps-aware)

`src/scripts/gerar-questao-bloco.js` é **caps-aware**: ao gerar para uma leg com
caps, distribui a meta de questões entre os caps (rodízio por `capIndex`) e injeta
no system prompt **o router + 1 cap por questão** (helper `loadLegCaps`). Legs sem
caps usam o fallback (skill monolítica) sem mudança. O cap escolhido fica
registrado em `revisao_notas.cap_foco`.

## Router (`leg/<id>.md`)

A skill no root de `leg/` deixou de ser monolítica nas legs fatiadas: virou
**roteador** (visão geral + índice de caps + regra de roteamento + pegadinhas
globais), mantendo o frontmatter exigido pelo manifest. `node src/scripts/auditar-skills.js`
deve continuar reportando **0 erros**.
