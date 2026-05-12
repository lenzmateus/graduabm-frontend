# Plano de Implementação: Ferramentas Interativas de Prova

Adiciona ferramentas interativas (Marca-texto, Lápis, Borracha, Tesoura) nas páginas de resolução, simulando a experiência de uma prova real.

## Decisões finais

1. **Dois botões separados** para Marca-texto Reta e Marca-texto Livre (mesma decisão aplica-se ao Lápis: Reta vs Livre). Mais explícito e evita estados ambíguos.
2. **Tema escuro**: o canvas usa traços com `rgba` semi-transparentes (amarelo 0.45 para marca, vermelho 0.7 para lápis). Não usar `multiply` — em fundo `#0F0F0F` o resultado some.
3. **Chave do sessionStorage**: `pbm_ferramentas_q_${q.id}` (id real da questão; estável entre re-renders e edições de conteúdo).
4. **Pointer Events** (`pointerdown/move/up`) em vez de mouse+touch separados.
5. **Seletores configuráveis por página** — o módulo recebe um config com os IDs/classes específicos de cada layout.
6. **Hook explícito no render**: cada página chama `PBMFerramentas.onQuestaoChange(q.id)` no fim da função que monta a questão. Mais previsível que MutationObserver.
7. **Resize do canvas**: listener de `resize` reaplica o `toDataURL` salvo.

## Mapa de seletores por página

| Página | Container | Enunciado | Lista de alts | Texto da alt |
|---|---|---|---|---|
| `pbm-questoes.html` | `.questao-card` | `#enunciado` | `#alternativas` | `.alt > span` |
| `pbm-simulado-prova.html` | `.questao-container` | `#q-enunciado` | `#alts-lista` | `.alt > .alt-texto` |
| `pbm-simulado-mensal.html` | `.questao-container` | `#q-enunciado` | `#alts-lista` | `.alt > .alt-texto` |

## Proposed Changes

### 1. Novo módulo: `js/ferramentas-prova.js`

API pública:
```js
PBMFerramentas.init({
  containerSelector, enunciadoSelector, altsContainerSelector, altTextoSelector
});
PBMFerramentas.onQuestaoChange(questaoId);
```

Componentes:
- **Toolbar flutuante draggable** (cinco botões: marca reta, marca livre, lápis reta, lápis livre, borracha) — fixed bottom-right; handle de arrastar no topo.
- **Marca/Lápis Reta** (`window.getSelection`): envolve a seleção em `<span class="pbm-hl-marca">` ou `<span class="pbm-hl-lapis">`. Restrito ao enunciado e à área de texto das alternativas. Usa `range.surroundContents` com fallback para `extractContents` em seleções complexas.
- **Marca/Lápis Livre** (`<canvas>`): canvas absoluto sobrepondo o container, `pointer-events: auto` apenas no modo livre, traços em rgba semi-transparente. Cores claras (não multiply) para visibilidade no tema escuro.
- **Borracha**: clica em `<span>` de marcação no DOM para remover; sobre o canvas usa `globalCompositeOperation = 'destination-out'`. A decisão entre DOM vs canvas vem do elemento sob o cursor.
- **Tesoura**: injetada como botão SVG dentro de cada `.alt` no `onQuestaoChange`. Click adiciona `.alt-eliminada` (opacidade reduzida + linha diagonal) e chama `e.stopPropagation()`.

### 2. Persistência (sessionStorage)

Chave: `pbm_ferramentas_q_${q.id}`
```json
{
  "enunciadoHTML": "...",
  "altsHTML": { "A": "...", "B": "..." },
  "eliminadas": ["B", "D"],
  "canvasData": "data:image/png;base64,..."
}
```

### 3. Injeção do script + hook nas páginas

- `pbm-questoes.html`: `<script src="/js/ferramentas-prova.js">` + chamada de `init` no DOMContentLoaded + `onQuestaoChange(q.id)` no fim de `mostrarQuestao()`.
- `pbm-simulado-prova.html`: idem, hook no fim de `carregarQuestao()`.
- `pbm-simulado-mensal.html`: idem, hook no fim de `carregarQuestao()`.

## Verification Plan

- `/questoes`: alternar entre marca reta e livre; navegar → voltar → marcações persistem.
- `/simulado-prova`: tesoura riscando alternativas + borracha apagando tanto canvas quanto spans.
- Mobile: testar pointer events em touch.
- Resize de janela: rabiscos no canvas redesenham na nova dimensão.
