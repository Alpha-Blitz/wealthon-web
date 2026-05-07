# DESIGN_SYSTEM.md — Wealthon Capital Ventures

## Design philosophy
Private members club meets Bloomberg terminal.
Quiet luxury. Dark. Intentional.
**Restraint is the luxury signal. One dramatic element per screen maximum.**

---

## COLOR TOKENS

```css
/* globals.css — paste these as CSS variables */
:root {
  /* Backgrounds */
  --bg-primary:     #080808;   /* Page background */
  --bg-secondary:   #0F0F0F;   /* Section alternate */
  --bg-card:        #111111;   /* Card surface */
  --bg-card-hover:  #141414;   /* Card hover */
  --bg-input:       transparent;

  /* Gold — the ONLY accent color */
  --gold-primary:   #F5A623;   /* Main gold — CTAs, numbers, active states */
  --gold-secondary: #FFC15E;   /* Lighter gold — secondary highlights */
  --gold-muted:     #2A1F0A;   /* Dark gold tint — card backgrounds */
  --gold-border:    rgba(245, 166, 35, 0.2);   /* Default border */
  --gold-border-hover: rgba(245, 166, 35, 0.6); /* Hover border */

  /* Text */
  --text-primary:   #F0EDE6;   /* Warm off-white — never pure white */
  --text-secondary: #8A8070;   /* Muted warm grey */
  --text-muted:     #4A4438;   /* Very subtle — disclaimers, captions */

  /* Semantic */
  --success:        #22C55E;
  --success-bg:     rgba(34, 197, 94, 0.1);
  --warning:        #F59E0B;
  --warning-bg:     rgba(245, 158, 11, 0.1);
  --error:          #EF4444;
  --error-bg:       rgba(239, 68, 68, 0.1);
  --info:           #3B82F6;
  --info-bg:        rgba(59, 130, 246, 0.1);

  /* Borders */
  --border-default: rgba(245, 166, 35, 0.15);
  --border-subtle:  rgba(255, 255, 255, 0.06);

  /* Spacing base unit: 8px */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 40px;
  --space-6: 48px;
  --space-8: 64px;
  --space-10: 80px;
  --space-12: 96px;
  --space-16: 128px;
}
```

---

## TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#080808',
        surface: '#111111',
        gold: {
          DEFAULT: '#F5A623',
          secondary: '#FFC15E',
          muted: '#2A1F0A',
        },
        text: {
          primary: '#F0EDE6',
          secondary: '#8A8070',
          muted: '#4A4438',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        gold: 'rgba(245, 166, 35, 0.2)',
        'gold-hover': 'rgba(245, 166, 35, 0.6)',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## TYPOGRAPHY SCALE

| Style | Font | Weight | Size | Line Height | Use case |
|-------|------|--------|------|-------------|----------|
| Display Large | Playfair Display | 700 | 72px | 1.0 | Hero headline |
| Display | Playfair Display | 700 | 56px | 1.1 | Page titles |
| Heading 1 | Playfair Display | 600 | 40px | 1.2 | Section titles |
| Heading 2 | Playfair Display | 400 | 28px | 1.3 | Card titles |
| Heading 3 | Playfair Display | 400 | 20px | 1.4 | Sub-section |
| Body Large | Inter | 300 | 18px | 1.7 | Hero subline |
| Body | Inter | 300 | 16px | 1.7 | Default body |
| Body Small | Inter | 400 | 14px | 1.6 | Secondary text |
| Label | Inter | 400 | 11px | 1.4 | Eyebrows, badges |
| Caption | Inter | 300 | 12px | 1.5 | Disclaimers |

**Rules:**
- Eyebrow labels: Inter 400, uppercase, letter-spacing 0.15em, gold color
- Gold numbers in dashboard: Playfair Display 600
- Body text: NEVER use Inter 700 (bold) — max Inter 500 for UI labels
- Heading with gold period: `Where capital finds direction<span class="text-gold">.</span>`

---

## COMPONENT SPECS

### Button — Primary
```
Background: #F5A623
Text: #080808 (dark on gold)
Font: Inter 400, 14px, letter-spacing 0.05em
Padding: 12px 24px
Border radius: 4px (not pill — luxury feels sharp)
Hover: background #FFC15E
Active: background #D4911F
```

### Button — Secondary (outline)
```
Background: transparent
Border: 1px solid #F5A623
Text: #F5A623
Hover: background rgba(245,166,35,0.08)
Same padding and radius as primary
```

### Button — Tertiary (text)
```
Background: transparent
Border: none
Text: #F5A623 with arrow →
Hover: text #FFC15E
```

### Input (underline style — used everywhere)
```
Background: transparent
Border: none
Border-bottom: 1px solid rgba(255,255,255,0.15)
Text: #F0EDE6
Placeholder: #4A4438
Font: Inter 300, 14px
Padding: 12px 0
Focus: border-bottom-color: #F5A623, no outline
```

### Card (dark surface)
```
Background: #111111
Border: 0.5px solid rgba(245,166,35,0.15)
Border radius: 8px
Padding: 24px
Hover: border-color rgba(245,166,35,0.4), transform translateY(-2px)
Transition: all 0.2s ease
```

### MetricCard (dashboard stat card)
```
Same as Card above, plus:
- Subtle gold gradient at top: linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 60%)
- Icon: 40px circle, border 1px solid gold, gold icon inside
- Label: Inter 400, 11px, uppercase, letter-spacing 0.1em, #8A8070
- Value: Playfair Display 600, 36px, #F5A623
- Sub-label: Inter 300, 13px, #8A8070
```

### StatusPill
```
Active:     bg rgba(34,197,94,0.12),  text #22C55E,  border rgba(34,197,94,0.3)
Pending:    bg rgba(245,158,11,0.12), text #F59E0B,  border rgba(245,158,11,0.3)
Completed:  bg rgba(34,197,94,0.12),  text #22C55E,  border rgba(34,197,94,0.3)
Processing: bg rgba(59,130,246,0.12), text #3B82F6,  border rgba(59,130,246,0.3)
Paused:     bg rgba(107,114,128,0.12),text #6B7280,  border rgba(107,114,128,0.3)
Font: Inter 400, 11px, letter-spacing 0.05em
Padding: 3px 10px, border-radius: 20px
```

### Sidebar (dashboard)
```
Width: 240px
Background: #080808
Border-right: 1px solid rgba(245,166,35,0.1)
Nav item height: 44px
Nav item padding: 0 16px
Nav item font: Inter 400, 14px, #8A8070
Nav item hover: text #F0EDE6, bg rgba(255,255,255,0.04)
Nav item active: text #F5A623, bg rgba(245,166,35,0.08), border-left 2px solid #F5A623
Icon size: 18px, margin-right 12px
Section label: Inter 400, 10px, uppercase, letter-spacing 0.1em, #4A4438
```

### DataTable
```
Header row: bg #0F0F0F, Inter 400, 11px, uppercase, letter-spacing 0.08em, #F5A623
Body rows: alternating #111111 / #0D0D0D
Row hover: bg rgba(245,166,35,0.04)
Cell text: Inter 400, 14px, #F0EDE6
Cell secondary text: #8A8070
Border between rows: 1px solid rgba(255,255,255,0.04)
Positive amounts: #22C55E
Negative amounts: #EF4444
```

### Navbar
```
Height: 64px
Background transparent: on hero (backdrop-filter none)
Background scrolled: rgba(8,8,8,0.95), backdrop-filter blur(20px)
Border-bottom scrolled: 1px solid rgba(245,166,35,0.1)
Logo: navlogo.png, height 36px
Nav links: Inter 400, 14px, #8A8070, letter-spacing 0.02em
Nav links hover: #F0EDE6
Active nav link: #F5A623, border-bottom 1px solid #F5A623
CTA button: secondary style (gold outline)
Mobile: hamburger icon, slide-down menu, dark overlay
```

---

## SECTION SPACING

```
Section padding (desktop): 120px top and bottom
Section padding (mobile):  60px top and bottom
Content max-width: 1200px
Content padding horizontal: 40px (desktop), 20px (mobile)
Section eyebrow margin-bottom: 16px
Eyebrow to heading margin: 12px
Heading to subline margin: 20px
Subline to content margin: 40px
Card grid gap: 16px
```

---

## ANIMATION STANDARDS

```css
/* Fade up on scroll — apply to all section content */
.fade-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger for card grids — add delay via inline style */
/* card-1: delay 0ms, card-2: delay 100ms, card-3: delay 200ms */

/* Count-up on metric cards — trigger on first viewport entry */
/* Duration: 1200ms, easing: easeOutCubic */

/* Navbar transition */
transition: background 0.3s ease, backdrop-filter 0.3s ease;

/* Card hover */
transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

/* Scroll indicator bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
```

---

## CHART STYLING (Recharts)

```typescript
// Common chart theme
const chartTheme = {
  backgroundColor: 'transparent',
  gridColor: 'rgba(255,255,255,0.04)',
  axisColor: 'rgba(255,255,255,0.15)',
  labelColor: '#8A8070',
  tooltipBg: '#1a1a1a',
  tooltipBorder: 'rgba(245,166,35,0.3)',
  tooltipText: '#F0EDE6',
}

// Bar chart — gold bars
const barFill = '#F5A623'
const barFillNegative = '#EF4444'

// Line chart colors (multi-series from S2)
const lineColors = {
  allStrategies: '#F5A623',  // gold
  equity: '#3B82F6',          // blue
  forex: '#8B5CF6',           // purple
  commodities: '#06B6D4',     // cyan
}

// Donut chart (allocation)
const donutColors = ['#F5A623', '#3B82F6', '#06B6D4', '#FFC15E', '#8B5CF6']
```

---

## SPECIFIC SECTION IMPLEMENTATION NOTES

### Hero section
- Banner image: `object-fit: cover`, overlay `linear-gradient(to right, rgba(8,8,8,0.92) 35%, rgba(8,8,8,0.6) 65%, rgba(8,8,8,0.3) 100%)`
- Compass overlay: bottom-right, `width: 45vw`, `opacity: 0.35`, `mix-blend-mode: luminosity`
- Stat blocks: no background, separated by `1px solid rgba(245,166,35,0.2)` vertical dividers
- Scroll indicator: `position: absolute, bottom: 32px`, animated bounce

### How it works — timeline
- Vertical gold line: `position: absolute, left: 0, width: 1px, background: linear-gradient(to bottom, transparent, #F5A623, transparent)`
- Step number (large faint bg): Playfair 700, `font-size: 120px`, `color: rgba(245,166,35,0.04)`, positioned behind content
- Step dot: `8px circle, background: #F5A623, border: 2px solid #080808, outline: 1px solid #F5A623`

### Calculator slider
```css
input[type=range] {
  -webkit-appearance: none;
  background: rgba(245,166,35,0.15);
  height: 2px;
  border-radius: 1px;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #F5A623;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(245,166,35,0.5);
}
```

### Login page split
- Left 45%: banner.png, `object-fit: cover`, dark overlay `rgba(8,8,8,0.7)`
- Right 55%: `background: #080808`, centered form card
- Form card: `max-width: 420px`, `background: #111111`, `border: 0.5px solid rgba(245,166,35,0.2)`
- Compass watermark behind form: `opacity: 0.04`, `position: absolute`

### Floating WhatsApp button
```
Position: fixed, bottom: 24px, right: 24px, z-index: 50
Size: 56px circle
Background: #F5A623 (gold — NOT green)
Shadow: 0 4px 20px rgba(245,166,35,0.4)
Icon: MessageCircle from lucide-react, white, 24px
Hover: scale(1.05), shadow intensifies
```

---

## NOISE TEXTURE OVERLAY

Apply to all dark sections for the subtle grain effect seen in designs:

```css
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.4;
}
```

---

## MOBILE BREAKPOINTS

```
sm:  640px   (large phones landscape)
md:  768px   (tablets)
lg:  1024px  (small laptops)
xl:  1280px  (desktop)
2xl: 1536px  (large desktop)
```

Dashboard mobile (below md):
- Sidebar → bottom tab navigation (5 tabs max)
- Metric cards → 2×2 grid
- Charts → horizontal scroll container
- Tables → horizontal scroll, sticky first column

Homepage mobile (below md):
- Hero → full screen, content centered, image darkened further
- Stats → 2×2 grid
- Service cards → single column
- Timeline → vertical, no large faint numbers
- Calculator → full width, vertical layout
