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

## Formato dos arquivos

Frontmatter obrigatório:
```yaml
---
parent_leg: <manifest_id da leg>
capitulo|modulo|parte: <identificador>
titulo: <título humano>
fonte: <path + intervalo de linhas>
area_tematica: <AT1..AT5>
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
