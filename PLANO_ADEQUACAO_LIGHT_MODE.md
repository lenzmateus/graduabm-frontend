# Plano de Adequação do Light Mode

> Levantado em 2026-05-16 após primeira leva do tema (Escuro/Claro/Sistema).
> Diagnóstico baseado em feedback do usuário + leitura dos arquivos afetados.

---

## Fase 0 — Modo padrão = ESCURO  *(crítico, 2 linhas)*

**Problema:** hoje o boot script faz fallback para `'system'` (segue o SO). Usuário quer escuro como padrão e troca manual se quiser claro.

**Arquivos:**
- `js/pbm-theme-boot.js` linha 5: `'system'` → `'dark'`
- `js/api.js` IIFE topo (linha ~11) e `PBM.Theme.getPreference()` (linha ~80): mesmo

**Resultado:** usuário novo abre escuro. Clica no Sol pra ir pro claro.

---

## Fase 1 — Texto das alternativas  *(alta — afeta leitura de questões)*

**Causa:** `pbm-questoes.html` linha 257: `.alt { color: #bbb; }` (cinza claro hardcoded). No fundo branco fica quase invisível.

**Fix:**
- `color: #bbb` → `color: var(--texto-principal)` (escuro no light, claro no dark)
- `.alt:hover` linha 260: `border-color: #555` → `var(--texto-suporte)`

Estados `correta` / `errada` / `selecionada` já estão tokenizados, OK.

---

## Fase 2 — Overlays de banner com `rgba(15,15,15,…)` hardcoded  *(alta — vários banners pretos)*

**Causa:** 4+ gradientes pelo projeto usam `rgba(15,15,15, X)` literal pra criar fade sobre imagens. No light, vira preto sobre branco.

**Locais identificados:**

| Arquivo | Linha | O que é |
|---|---|---|
| `pbm-dashboard.html` | 427 | Banner "Bem-vindo, Combatente" (hero do dashboard) |
| `pbm-area-estudos.html` | 123 | Overlay sobre o emblema na seleção de área temática |
| `login.html` | 96 | Fade do side-esquerdo da tela de login |
| `index.html` | (verificar antes) | Banner topo da landing |
| `admin-cadastro.html` | (verificar antes) | Fade que ficou ruim |
| `pbm-ciclo-estudos.html` | (verificar antes) | Banner "Monte seu ciclo" com fade impedindo leitura |

**Fix:** adicionar 3 tokens semânticos novos em `css/pbm-tokens.css`:

```css
:root {
  --banner-fade-strong:  rgba(15,15,15,1);
  --banner-fade-medium:  rgba(15,15,15,0.92);
  --banner-fade-light:   rgba(15,15,15,0.4);
}
:root.light-mode {
  --banner-fade-strong:  rgba(244,245,247,1);
  --banner-fade-medium:  rgba(244,245,247,0.94);
  --banner-fade-light:   rgba(244,245,247,0.5);
}
```

Substituir os `rgba(15,15,15,…)` literais nos 6 arquivos.

**Sobre o banner "Monte seu ciclo" com fade que impede leitura:** além de tokenizar, reduzir opacidade do overlay no light para o texto não ficar lavado.

---

## Fase 3 — Cards de gradiente diagonal  *(média — dashboard)*

**Causa:** `pbm-dashboard.html` linhas 1120, 1150, 1176 — cards com `linear-gradient(135deg, var(--bg-secundario) 0%, #161616 100%)`. `#161616` fixo escuro.

**Fix:** trocar `#161616` por `var(--bg-primario)`.
- No dark: praticamente igual (#1A1A1A → #0F0F0F)
- No light: gradiente clarinho (#FFFFFF → #F4F5F7)

3 substituições simples.

---

## Fase 4 — Tour guiado  *(alta — 11 cores hardcoded em `js/tour.js`)*

**Causa:** `js/tour.js` linhas 484–540 injetam `<style>` dinâmico com cores cravadas:
- `#1A1A1A` tooltip bg
- `#2A2A2A` border
- `#F8F6F2` título
- `#888` body
- `#555` skip
- `#333` botão
- `#C0270F` brand
- `rgba(0,0,0,0.75)` spotlight
- `rgba(0,0,0,0.82)` modal center

**Fix:**
- Substituir por tokens semânticos: `var(--bg-secundario)`, `var(--border-color)`, `var(--texto-principal)`, `var(--texto-suporte)`, `var(--brand-primary)`
- Spotlight `rgba(0,0,0,0.75)` → reduzir para `rgba(0,0,0,0.55)` no light pra ficar perceptível mas não tampar o destaque (pode virar variável `--tour-spotlight` ou usar `rgba(0,0,0,…)` mesmo via classe)

Tour passa a respeitar o tema atual.

---

## Fase 5 — Barra de ferramentas em /questoes  *(média — afeta foco da prova)*

**Local não confirmado ainda.** Provavelmente é a barra com tesoura/relógio/denúncia. Preciso identificar o seletor exato (`.barra-ferramentas`? `.toolbar-questao`?). Quando achar, mesmo padrão: tokenizar `background`, `border`, `color`.

**Passo prévio:** abrir `pbm-questoes.html` no browser em light mode e localizar pelo DevTools.

---

## Fase 6 — Acentos hardcoded (`#C0270F` em texto)  *(baixa, polimento)*

Vários títulos/labels no dashboard ainda têm `color: #C0270F` literal (ex: "Você não estuda. Você Treina.", "Bem-vindo," span). No fundo claro funciona mas fica no limite WCAG AA.

**Fix:** trocar por `var(--brand-primary)` (já escurece pra `#9A1F0C` no light).

~50-80 ocorrências espalhadas. Paralelizar com `replace_all` defensivo (**usar Bash, não PowerShell** — PowerShell foi o que zerou os HTMLs na primeira leva).

---

## Ordem sugerida de execução

**Primeira leva** (afeta o que o usuário vê primeiro):
- Fase 0 — Modo padrão escuro
- Fase 1 — Texto das alternativas
- Fase 2 — Banners com `rgba(15,15,15,…)`
- Fase 4 — Tour guiado

**Segunda leva** (polimento):
- Fase 3 — Cards de gradiente diagonal
- Fase 5 — Barra de ferramentas /questoes
- Fase 6 — Acentos `#C0270F`

---

## Regras operacionais para a próxima sessão

1. **Nunca usar PowerShell com `-replace` + concatenação para escrever HTMLs em lote** — na primeira leva isso zerou 33 arquivos (recuperados via `git restore`). Use `[System.IO.File]::WriteAllText` com checks `IsNullOrEmpty` e `Length < N`. Ou prefira Bash com `sed -i`.
2. **Sempre `git status` antes de começar** — ter checkpoint visível.
3. **Verificar visualmente antes de marcar Fase como concluída** — não confiar só em "Edit aplicado".
4. **Deploy final:** `cd c:/Users/mateu/Desktop/graduabm-frontend && vercel --prod --yes`.
