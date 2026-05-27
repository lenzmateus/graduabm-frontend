---
manifest_id: manual-combate-cbmmg
nome: Manual de Combate a Incêndio Urbano CBMMG (Caps. 1, 2, 3, 5 e 7)
area_tematica: AT2
curso: ambos
arquivo_md: manual-combate-cbmmg.md
---

# Manual de Combate a Incêndio Urbano — CBMMG (MABOM, 1ª Ed. 2020)

> **Esta skill é um ROUTER.** O conteúdo doutrinário detalhado vive nos especialistas por capítulo em `skills/leg/_caps/manual-combate-cbmmg/`. Antes de elaborar/auditar questão, identifique o capítulo e abra o arquivo correspondente — **não dê veredicto técnico a partir deste arquivo**.

## Escopo cobrado no edital

Apenas **cinco** dos quinze capítulos do manual entram nas portarias 078/2024 (CTSP) e 038/2024 (CBA).

| Cap | Título | Skill especialista | Linhas no `.md` fonte |
|-----|--------|---------------------|------------------------|
| 1 | Fundamentos e Comportamento do Fogo | [`_caps/manual-combate-cbmmg/cap01.md`](_caps/manual-combate-cbmmg/cap01.md) | 44–2054 |
| 2 | Equipamentos de Proteção Individual e Respiratória (EPI/EPR) | [`_caps/manual-combate-cbmmg/cap02.md`](_caps/manual-combate-cbmmg/cap02.md) | 2055–2943 |
| 3 | Materiais Básicos de Combate a Incêndio Urbano | [`_caps/manual-combate-cbmmg/cap03.md`](_caps/manual-combate-cbmmg/cap03.md) | 2944–3326 |
| 5 | Técnicas de Combate a Incêndio Urbano | [`_caps/manual-combate-cbmmg/cap05.md`](_caps/manual-combate-cbmmg/cap05.md) | 3327–3628 |
| 7 | Entradas Forçadas | [`_caps/manual-combate-cbmmg/cap07.md`](_caps/manual-combate-cbmmg/cap07.md) | 3629–4303 |

**Fora do recorte do edital:** Cap 4 (mangueiras/estabelecimentos), Cap 6 (passagem de porta), Cap 8 (salvamento em incêndio), Cap 9 (ventilação tática), Caps 10–15 (veículos, caminhão-tanque, GLP, tática, MSCIP, avaliação de danos). Esses capítulos foram **removidos do `.md` fonte** no trim de 21/05/2026 — não existem mais para citar.

## Roteamento por tema (lookup table)

Quando a questão chega, ache o capítulo pelo termo central do enunciado e roteie para o `_caps/` correspondente. **Tudo o que está abaixo é cap 1, 2, 3, 5 ou 7 — não marcar "fora do recorte" sem confirmar contra o `_caps/` de destino.**

- **Tetraedro do fogo, classes de incêndio (A–K), transferência de calor (condução/convecção/radiação), fases do incêndio compartimentado, flashover, backdraft, smoke reading** → **Cap 1**
- **EPI completo (capacete, balaclava, jaqueta/calça, luvas, botas), camadas da roupa de aproximação, EPR aberto/fechado, regra dos terços, autonomia, inspeção, equipagem/desequipagem, NR-6, CA, monóxido de carbono, carboxiemoglobina, hipóxia, inalação de fumaça, estresse térmico, cãibras, exaustão, intermação, queimaduras (graus), choque elétrico no combatente** → **Cap 2**
- **Mangueiras (tipos, diâmetros, pressão), esguichos (agulheta, regulável, jato sólido/neblinado), divisor, redutor, coletor, chave de mangueira** → **Cap 3**
- **Ataque direto, indireto, combinado, postura ofensiva/defensiva, reset, gas cooling, pulso curto/médio/longo, jato atomizado, ZOTI** → **Cap 5**
- **Ferramentas de arrombamento (machado, pé-de-cabra, alavanca, marreta, serra), técnicas em portas (madeira/metálicas/sentido de abertura), janelas, telhados, risco de admissão de O₂** → **Cap 7**

## Lições aprendidas — não repetir

1. **2026-05-21:** Auditor único subdimensionou o recorte e marcou como FORA temas que são DENTRO (carboxiemoglobina, NR-6, etc.). Resultado: 33 questões hard-deleted indevidamente + 4 inativadas (reativadas em 27/05). **Use sempre o `_caps/` correto antes de marcar FORA_DO_RECORTE.**
2. **NR-6** está EXPLICITAMENTE citada no Cap 2 do MABOM (seção 2). Não confundir "NR é trabalhista" com "fora da leg".
3. **Carboxiemoglobina/CO/hipóxia** são proteção respiratória do COMBATENTE (Cap 2, seção 3.1.1), não APH.
4. **Estresse térmico/cãibras/intermação** são risco ocupacional do COMBATENTE (Cap 2, seção 3.1.4), não medicina geral.
5. **Excluir** só por defeito editorial (gabarito errado comprovado, alternativas truncadas, duplicata exata). Tema fora do cap mas dentro de outro cap coberto = LEG_ERRADA com sugestão de cap correto, NÃO exclusão.

## Procedimento de auditoria

1. Identifique o tema central do enunciado.
2. Consulte a tabela de roteamento acima → abra o `_caps/manual-combate-cbmmg/capNN.md` correspondente.
3. Audite contra a skill desse capítulo.
4. Se o tema não está em nenhum dos 5 caps cobertos → propor `inativar_e_auditar` (sempre ⚠️ fila humana).

## Histórico
- **1ª Edição, 2020** (Belo Horizonte) — única edição vigente.
- **2026-05-21:** `.md` fonte trimmado para conter apenas Caps. 1, 2, 3, 5 e 7.

## Referência
Texto integral em `src/legislacoes/manual-combate-cbmmg.md` (4303 linhas após trim).
