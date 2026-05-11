# Plano de Unificação de Identidade Visual — Scrollbar

Unificar o estilo das barras de rolagem (scrollbars) em todo o site Protocolo Bravo Mike, seguindo os tokens de design estabelecidos no `DESIGN.md`.

## User Review Required

> [!IMPORTANT]
> A alteração será aplicada globalmente via injeção de CSS no arquivo `js/api.js`. Arquivos que não incluem este script serão atualizados manualmente.

## Proposta de Mudanças

### Global (Frontend)

#### [MODIFY] [api.js](file:///C:/Users/mateu/Desktop/graduabm-frontend/js/api.js)
- Adicionar injeção de CSS global ao final do arquivo para cobrir todos os elementos (`body`, `textarea`, `div`, etc).

```javascript
/* Injeção de CSS Global (Scrollbar Unificada) */
(function() {
  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0F0F0F; }
    ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; border: 2px solid #0F0F0F; }
    ::-webkit-scrollbar-thumb:hover { background: #333333; }
    * { scrollbar-width: thin; scrollbar-color: #2A2A2A #0F0F0F; }
  `;
  document.head.appendChild(style);
})();
```

#### [MODIFY] [index.html](file:///C:/Users/mateu/Desktop/graduabm-frontend/index.html)
#### [MODIFY] [instagram-questao-do-dia.html](file:///C:/Users/mateu/Desktop/graduabm-frontend/instagram-questao-do-dia.html)
#### [MODIFY] [pbm-checkout-sucesso.html](file:///C:/Users/mateu/Desktop/graduabm-frontend/pbm-checkout-sucesso.html)
#### [MODIFY] [preview.html](file:///C:/Users/mateu/Desktop/graduabm-frontend/preview.html)
#### [MODIFY] [regras.html](file:///C:/Users/mateu/Desktop/graduabm-frontend/regras.html)
- Adicionar o bloco de CSS de scrollbar no `<style>` existente.

#### [MODIFY] [admin-simulados-mensais.html](file:///C:/Users/mateu/Desktop/graduabm-frontend/admin-simulados-mensais.html)
- Remover definições locais de scrollbar (`.bleg-scroll`) para manter a consistência com o padrão global de 8px.

## Plano de Verificação

### Verificação Manual
- Abrir `index.html` e verificar se a scrollbar do navegador mudou para o padrão escuro.
- Abrir `pbm-questoes.html`, abrir o modal de denúncia e verificar se o `textarea` tem a scrollbar unificada.
- Verificar o painel admin para garantir que a barra lateral e containers também seguem o padrão.
