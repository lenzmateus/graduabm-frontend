# Design System — Protocolo Bravo Mike

## 1. Visual Theme & Atmosphere

Protocolo Bravo Mike is a military-grade study platform for competitive public service exams. The interface communicates **discipline, hierarchy, and operational clarity** — the same values a firefighter cadet internalizes in training. Every pixel serves a function; ornamentation is a liability.

The visual language is **dark military**: near-black backgrounds with a single warm accent — vermelho (`#C0270F`) — reserved exclusively for primary actions, critical emphasis, and the CTSP course identity. The blue (`#185FA5`) is the CBA counterpart: cooler, institutional, controlled. Together they create a dual-identity system without visual chaos.

Typography is a weapon of differentiation. **Bebas Neue** handles all display and numeric contexts — headlines, area codes, large statistics — with the compressed urgency of a military stencil. **Inter** is the workhorse: clean, modern, legible at all sizes for UI labels, body text, and buttons. **IBM Plex Mono** appears for technical identifiers: AT badges, legislation codes, session IDs. The combination is intentional — stencil for authority, humanist sans for readability, mono for precision.

The grid is dense but organized. Screens carry substantial information — performance stats, question banks, legislation lists — but visual hierarchy ensures the most important datum is always dominant. White space exists where it earns its keep; packing is the default.

**Key Characteristics:**
- Near-black `#0F0F0F` canvas — not pure black, preventing harshness while maintaining depth
- Single warm accent: vermelho `#C0270F` for primary actions, active states, CTSP identity
- Cool secondary: azul `#185FA5` for CBA course identity and supplementary emphasis
- Bebas Neue for display/numeric — compressed, stencil-like, authoritative
- Inter for UI and body — neutral, legible, modern
- IBM Plex Mono for technical labels — AT badges, codes, data identifiers
- Borders as 1px lines (`#333333`), never as gradients or glow
- Shadows restrained to `0 2px 12px rgba(0,0,0,0.4)` maximum — no decorative depth
- No colorful gradients — only dark-to-transparent overlays (`rgba(0,0,0,x)`)
- Information density is high by design — the interface treats the user as a disciplined adult

---

## 2. Color Palette & Roles

### Primary Surfaces
- **Carvão** (`#0F0F0F`): Page background, the operational void. Primary canvas for all content.
- **Cinza Escuro** (`#1A1A1A`): Cards, panels, sidebar. The level above the background.
- **Cinza Médio** (`#2A2A2A`): Hover states, active rows, nested containers.
- **Cinza Borda** (`#333333`): All borders, dividers, separators. 1px lines only.

### Text
- **Branco** (`#F8F6F2`): Primary text — headings, body copy, labels. Slightly warm to avoid harshness against dark backgrounds.
- **Branco Suave** (`#EFEFEA`): Secondary text — descriptions, metadata that supports but doesn't lead.
- **Cinza Texto** (`#888888`): Tertiary text — timestamps, disabled states, placeholder content.

### Accent — Course Identity
- **Vermelho** (`#C0270F`): Primary accent. CTAs, active navigation, CTSP badge, progress indicators, error states. Used sparingly — every instance carries weight.
- **Vermelho Escuro** (`#8B1A08`): Hover and pressed state of vermelho. Never used as background fill.
- **Azul** (`#185FA5`): CBA course identity. CBA badges, CBA-specific UI elements, secondary informational states.

### Area Thematic Overlays (AT Cards)
- **AT1 Overlay** (`rgba(192,39,15,0.72)`): Segurança contra incêndios — vermelho
- **AT2 Overlay** (`rgba(186,117,23,0.72)`): Combate a incêndios — âmbar
- **AT3 Overlay** (`rgba(24,95,165,0.72)`): Buscas e salvamentos / APH — azul
- **AT4 Overlay** (`rgba(39,160,90,0.72)`): Direito militar — verde
- **AT5 Overlay** (`rgba(127,119,221,0.72)`): Normas administrativas — roxo

### Semantic States
- **Sucesso** (`#27A060`): Correct answers, active subscriptions, positive feedback.
- **Atenção** (`#BA7517`): Warnings, time running low, neutral performance.
- **Erro** (`#C0270F`): Wrong answers, expired subscriptions. Shares vermelho — intentional.
- **Info** (`#185FA5`): Informational hints. Shares azul — intentional.

### Shadows & Depth
- **Card Shadow**: `0 2px 12px rgba(0,0,0,0.4)` — the maximum allowed elevation
- **Subtle Lift**: `0 1px 4px rgba(0,0,0,0.25)` — for smaller interactive elements
- **No glow effects** — light-emitting shadows are forbidden

---

## 3. Typography Rules

### Font Family
- **Display**: `'Bebas Neue', Impact, sans-serif` — headlines, area codes, large stats, timers
- **UI / Body**: `'Inter', 'IBM Plex Sans', system-ui, sans-serif` — all body copy, labels, buttons, navigation
- **Technical / Code**: `'IBM Plex Mono', 'Fira Code', monospace` — AT badges, legislation codes, session IDs, technical identifiers

### Hierarchy

| Role | Font | Size | Weight | Letter Spacing | Use |
|------|------|------|--------|----------------|-----|
| Page Hero | Bebas Neue | 64px | 400 | 0.04em | Landing headlines |
| Section Title | Bebas Neue | 40px | 400 | 0.03em | Dashboard sections, page titles |
| Card Headline | Bebas Neue | 28px | 400 | 0.02em | Card headings, AT area codes |
| Large Stat | Bebas Neue | 48px | 400 | normal | Performance numbers, timer countdown |
| Body Large | Inter | 18px | 400 | normal | Question text, legislation body |
| Body | Inter | 16px | 400 | normal | Standard UI text, descriptions |
| Body Medium | Inter | 16px | 500 | normal | Labels, navigation items, button text |
| Body Bold | Inter | 16px | 700 | normal | Emphasized labels, active nav |
| Small | Inter | 14px | 400 | normal | Metadata, secondary info |
| Small Medium | Inter | 14px | 500 | normal | Tags, small buttons, captions |
| Caption | Inter | 12px | 400 | 0.01em | Timestamps, fine print |
| Mono Tag | IBM Plex Mono | 13px | 500 | 0.05em | AT badges, legislation codes, uppercase labels |
| Mono Small | IBM Plex Mono | 11px | 400 | 0.04em | Technical identifiers, IDs |

### Principles
- **Bebas Neue is for authority, not decoration.** Use only for numbers, codes, and titles that demand immediate visual dominance. Never mix Bebas Neue with Inter at the same visual level.
- **Inter carries the platform.** All interactive elements, labels, navigation, and body copy use Inter. Consistent weight selection: 400 (reading), 500 (UI/interactive), 700 (strong emphasis or active state).
- **IBM Plex Mono for machine-readable identity.** AT codes (AT1, AT2…), legislation IDs, session timestamps, and scores use Plex Mono. Always uppercase for short codes.
- **No italic text** except inside quoted legislation excerpts.
- **No underline** except on hyperlinks.

---

## 4. Spacing & Layout

### Base Unit
- **8px base grid.** All spacing is a multiple of 4px or 8px.

### Spacing Scale
| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Icon-text gap, inline spacing |
| `--space-2` | 8px | Tight component padding |
| `--space-3` | 12px | Default item padding |
| `--space-4` | 16px | Card padding, list item height |
| `--space-5` | 24px | Section internal padding |
| `--space-6` | 32px | Between related sections |
| `--space-8` | 48px | Between major page sections |
| `--space-10` | 64px | Hero / page-level separation |

### Border Radius Scale
| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Badges, inline tags |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modal, large containers |
| `--radius-pill` | 9999px | Pill badges, toggles |

### Layout Structure
- **Sidebar width:** 240px (desktop), collapses to bottom bar on mobile (≤768px)
- **Content area:** `calc(100vw - 240px)` with `max-width: 1280px` and `margin: 0 auto`
- **Card grid:** CSS Grid, `repeat(auto-fill, minmax(280px, 1fr))` for card layouts
- **Header height:** 64px (internal pages)

---

## 5. Component Stylings

### Buttons

**Primary (Vermelho)**
```css
background: #C0270F;
color: #F8F6F2;
padding: 10px 20px;
border-radius: 8px;
font: 500 15px/1 Inter;
border: none;
cursor: pointer;
transition: background 0.15s ease;

/* Hover */
background: #8B1A08;

/* Active */
transform: translateY(1px);
```

**Secondary (Outline)**
```css
background: transparent;
color: #F8F6F2;
padding: 10px 20px;
border-radius: 8px;
font: 500 15px/1 Inter;
border: 1px solid #333333;
cursor: pointer;
transition: border-color 0.15s, background 0.15s;

/* Hover */
background: #1A1A1A;
border-color: #555555;
```

**Ghost / Text Button**
```css
background: transparent;
color: #888888;
padding: 8px 12px;
border: none;
font: 400 14px/1 Inter;
cursor: pointer;
transition: color 0.15s;

/* Hover */
color: #F8F6F2;
```

**Danger**
```css
/* Same as Primary but reserved for destructive actions */
background: #C0270F;
/* Label must make destructive intent explicit */
```

### Cards

**Standard Card**
```css
background: #1A1A1A;
border: 1px solid #333333;
border-radius: 12px;
padding: 24px;
box-shadow: 0 2px 12px rgba(0,0,0,0.4);
```

**Highlighted Card (Active / Selected)**
```css
background: #1A1A1A;
border: 1px solid #C0270F;
border-radius: 12px;
padding: 24px;
box-shadow: 0 0 0 1px #C0270F;
```

**AT Area Card (640 × 200px)**
```css
position: relative;
background-image: url('/images/card-at{N}.png');
background-size: cover;
background-position: center right;
height: 120px;
border-radius: 12px;
border-left: 3px solid {AT_COLOR};
overflow: hidden;
cursor: pointer;
transition: filter 0.15s;

/* Hover */
filter: brightness(1.1);

/* Inner overlay for legibility */
.card-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(15,15,15,0.55);
}
```

### Navigation / Sidebar

```css
/* Sidebar container */
.sidebar {
  width: 240px;
  background: #0F0F0F;
  border-right: 1px solid #1A1A1A;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Nav item */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-radius: 8px;
  margin: 0 8px;
  color: #888888;
  font: 500 14px/1 Inter;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

/* Active item */
.sidebar-item.active {
  background: #1A1A1A;
  color: #F8F6F2;
  border-left: 3px solid #C0270F;
  padding-left: 17px;
}

/* Hover */
.sidebar-item:hover {
  background: #1A1A1A;
  color: #EFEFEA;
}
```

### Badges / Tags

**AT Badge (Monospace)**
```css
.badge-at {
  font: 500 12px/1 'IBM Plex Mono';
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 4px;
  background: #2A2A2A;
  color: #F8F6F2;
  border: 1px solid #333333;
}
/* AT-specific colors via class: .badge-at1 { color: #C0270F; border-color: #C0270F33; } */
```

**Course Badge**
```css
.badge-ctsp {
  background: rgba(192,39,15,0.15);
  color: #C0270F;
  border: 1px solid rgba(192,39,15,0.3);
  font: 600 11px/1 IBM Plex Mono;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge-cba {
  background: rgba(24,95,165,0.15);
  color: #185FA5;
  border: 1px solid rgba(24,95,165,0.3);
  /* same font/padding/radius */
}
```

**Status Badge**
```css
.badge-ativo   { background: rgba(39,160,90,0.15);   color: #27A060; border: 1px solid rgba(39,160,90,0.3); }
.badge-inativo { background: rgba(136,136,136,0.15); color: #888888; border: 1px solid rgba(136,136,136,0.3); }
.badge-vencido { background: rgba(192,39,15,0.15);   color: #C0270F; border: 1px solid rgba(192,39,15,0.3); }
```

### Inputs & Forms

```css
input, select, textarea {
  background: #1A1A1A;
  border: 1px solid #333333;
  border-radius: 8px;
  color: #F8F6F2;
  font: 400 15px/1 Inter;
  padding: 10px 14px;
  width: 100%;
  transition: border-color 0.15s;
}

input::placeholder { color: #555555; }

input:focus, select:focus {
  outline: none;
  border-color: #C0270F;
  box-shadow: 0 0 0 2px rgba(192,39,15,0.15);
}

label {
  display: block;
  font: 500 13px/1 Inter;
  color: #888888;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

### Question Card (pbm-questoes.html)

```css
.questao-card {
  background: #1A1A1A;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 32px;
  position: relative;
  /* AT area indicator — left border, set per AT */
  border-left: 3px solid var(--at-color);
}

/* Watermark question number */
.questao-numero-watermark {
  position: absolute;
  top: 16px;
  right: 24px;
  font: 400 48px/1 'Bebas Neue';
  color: rgba(255,255,255,0.06);
  user-select: none;
  pointer-events: none;
}

/* Alternativa */
.alternativa {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 16px;
  border: 1px solid #2A2A2A;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.alternativa:hover { background: #2A2A2A; border-color: #444; }
.alternativa.correta { border-color: #27A060; background: rgba(39,160,90,0.1); }
.alternativa.errada  { border-color: #C0270F; background: rgba(192,39,15,0.1); }
.alternativa.marcada { border-color: #888888; background: rgba(255,255,255,0.04); }

/* Letra da alternativa */
.alternativa-letra {
  font: 700 15px/1 'IBM Plex Mono';
  color: #888888;
  min-width: 20px;
  padding-top: 1px;
}
```

### Answer Card / Cartão Resposta

```css
/* Bolinha do cartão resposta */
.bolinha {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #333333;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 13px/1 'IBM Plex Mono';
  color: #888888;
  cursor: pointer;
  transition: all 0.15s;
}
.bolinha:hover { border-color: #555555; color: #EFEFEA; }
.bolinha.marcada { background: #C0270F; border-color: #C0270F; color: #fff; }
```

### Progress Bar

```css
.progress-bar-track {
  background: #2A2A2A;
  border-radius: 9999px;
  height: 6px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  background: #C0270F;
  transition: width 0.3s ease;
}
```

### Stat Cards (Dashboard)

```css
.stat-card {
  background: #1A1A1A;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 20px 24px;
}
.stat-value {
  font: 400 40px/1 'Bebas Neue';
  color: #F8F6F2;
}
.stat-label {
  font: 500 12px/1 Inter;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}
```

### Timer (Simulado)

```css
.timer {
  font: 400 48px/1 'Bebas Neue';
  color: #F8F6F2;
  letter-spacing: 0.04em;
}
/* Last 5 minutes */
.timer.critico {
  color: #C0270F;
  animation: blink 1s step-end infinite;
}
@keyframes blink { 50% { opacity: 0.4; } }
```

---

## 6. Page-Specific Patterns

### Landing (`index.html`)
- Two-column grid: left (form/copy) on `#0F0F0F`, right (photo) full-height with `linear-gradient(95deg, #0F0F0F 0%, #0F0F0F 5%, transparent 35%)` overlay
- Hero headline: Bebas Neue 64px, tracking 0.04em
- CTA button spans full width on mobile

### Dashboard (`pbm-dashboard.html`)
- Welcome banner: `banner-dashboard.png` `object-fit: cover`, height 160px, `rgba(15,15,15,0.6)` overlay with greeting text
- Stat cards: 4-column grid on desktop, 2-column on tablet, 1-column on mobile
- Chart area: Card with `background: #1A1A1A`, Chart.js dual-axis (vermelho fill + azul dashed)

### Area Studies (`pbm-area-estudos.html`)
- AT cards: `background-image` with `card-at{N}.png`, `object-fit: cover`, `border-left: 3px solid {AT_COLOR}`
- AT code watermark: Bebas Neue 96px, `rgba(255,255,255,0.05)`, absolute positioned behind content

### Question View (`pbm-questoes.html`)
- `border-left: 3px solid {AT_COLOR}` on the question card matches the active AT
- AT badge (IBM Plex Mono) visible top-left of card
- Question number watermark: Bebas Neue 48px, `rgba(255,255,255,0.06)`, top-right

### Official Simulation (`pbm-simulado-prova.html`)
- Full-screen dark environment — no sidebar
- Timer Bebas Neue 48px, top-center
- Question grid: numbered cells, 10×6 for CTSP (60q), 10×4 for CBA (40q)
- Cartão Resposta overlay: two-column (rascunho / oficial), bolinhas A–E per row

### Instagram Template (1080 × 1080 px)
- Background: `#0F0F0F` solid
- Top bar: `#C0270F`, height 6px
- Header row: AT badge (left) + "PROTOCOLO**BM**" logo (right)
- Section label: Bebas Neue 36px, vermelho, uppercase
- Alternativas: `#1A1A1A` rows with `#2A2A2A` border
- Footer: "PROTOCOLO BM · .com.br" Inter 12px + CTA
- Gabarito slide: correct answer in box with `#C0270F` border, legal basis in IBM Plex Mono

---

## 7. Forbidden Patterns

These patterns violate the design system and must never appear:

| Pattern | Reason |
|---------|--------|
| White or light gray backgrounds (`#fff`, `#f5f5f5`) | Breaks dark military atmosphere |
| Colorful gradients (`linear-gradient(#C0270F, #185FA5)`) | Violates single-accent discipline |
| Drop shadows with color tint | Decorative; incompatible with system |
| Text in pure black (`#000`) | All text is on dark backgrounds — use `#F8F6F2` |
| Mix of Bebas Neue + Inter at equal visual hierarchy | Pick one per level |
| Animated entry effects (slide-in, fade-in carousels) | Platform is tools-first, not marketing |
| Photos as page backgrounds (full bleed without dark overlay) | Legibility risk; only `emblem-pbm.png` permitted as visual bg |
| "GraduaBM", "Gradua BM", "CBMRS", "Bombeiro Militar" in any visible text | Brand and legal risk |
| Rounded borders > 16px on non-pill elements | Looks consumer-app, not tactical |
| Box shadows with `blur > 16px` | Excessively soft; incompatible with precision aesthetic |

---

## 8. CSS Custom Properties (Root Variables)

```css
:root {
  /* Colors */
  --carvao:          #0F0F0F;
  --cinza-escuro:    #1A1A1A;
  --cinza-medio:     #2A2A2A;
  --cinza-borda:     #333333;
  --cinza-texto:     #888888;
  --vermelho:        #C0270F;
  --vermelho-escuro: #8B1A08;
  --azul:            #185FA5;
  --branco:          #F8F6F2;
  --branco-suave:    #EFEFEA;
  --sucesso:         #27A060;
  --atencao:         #BA7517;

  /* AT area colors */
  --at1-color: #C0270F;
  --at2-color: #BA7517;
  --at3-color: #185FA5;
  --at4-color: #27A060;
  --at5-color: #7F77DD;

  /* Typography */
  --font-display: 'Bebas Neue', Impact, sans-serif;
  --font-body:    'Inter', 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-8:  48px;
  --space-10: 64px;

  /* Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-card:   0 2px 12px rgba(0,0,0,0.4);
  --shadow-subtle: 0 1px 4px rgba(0,0,0,0.25);

  /* Layout */
  --sidebar-width:   240px;
  --content-max-width: 1280px;
  --header-height:   64px;
}
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Change |
|------------|-------|--------|
| Desktop | > 1024px | Sidebar 240px, full grid |
| Tablet | 768px–1024px | Sidebar collapses, 2-col grids |
| Mobile | ≤ 768px | Bottom bar replaces sidebar, 1-col layout |

### Mobile Bottom Bar (replaces sidebar on ≤768px)
```css
.bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: #0F0F0F;
  border-top: 1px solid #1A1A1A;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}
```

---

## 10. Agent Instructions

When building UI for Protocolo Bravo Mike using this DESIGN.md:

1. **Always start from the CSS variables** defined in Section 8 — never hardcode color hex values in component CSS.
2. **Choose Bebas Neue or Inter per visual level** — never both at the same level. Bebas for display, Inter for UI.
3. **Single accent principle** — vermelho `#C0270F` appears once per component as the dominant accent. Two vermelho elements in the same card = violation.
4. **Verify any image references** — banners and AT card images live in `/images/`. If the file doesn't exist yet, use a dark placeholder `background: #1A1A1A` rather than an external URL.
5. **No white backgrounds** — if unsure, use `#1A1A1A`. If more depth needed, `#0F0F0F`.
6. **IBM Plex Mono is not decoration** — only use it for machine-readable data: AT codes, legislation IDs, session numbers, scores. Text prose never uses mono.
7. **Don't add animations** except functional transitions (`transition: 0.15s ease` on hover/focus states). No entrance animations, no parallax.
8. **Test at 375px and 1440px** — both must be functional.
9. **When referencing course identity**: CTSP = vermelho `#C0270F`, CBA = azul `#185FA5`. Never swap.
10. **Logo text format**: always `PROTOCOLO <strong>BM</strong>` in HTML — "BM" in bold, never the full "Protocolo Bravo Mike" in a single weight.
