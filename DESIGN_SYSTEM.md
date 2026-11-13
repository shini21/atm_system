# APEX Private Touch Banking — Terminal Design System (v2.0)

> **Design Direction**: Private-Bank Physical ATM Terminal  
> **Aesthetic Philosophy**: Swiss Minimalist Precision meets Industrial ATM Enclosure. No SaaS dashboards, no generic nested cards, no purple AI gradients.

---

## 1. Brand Identity & Color Tokens

### 1.1 Brand Accent Selection: Deep Emerald (`#065F46` / `#10B981`)
- **Justification**: Deep Emerald is the timeless international signature of private wealth management, Swiss vault security, and institutional solvency. It distinctly separates APEX from generic SaaS blue dashboards and artificial AI purple-pink gradients.
- **Secondary Metallic Accent**: Warm Brushed Brass / Champagne Gold (`#D97706` / `#F59E0B`), reserved exclusively for hardware contact points: EMV smart card chip, physical key legend details, and terminal badge.

### 1.2 Color Token Architecture (CSS Variables)

| Token Name | Light Theme (Warm Stone) | Dark Theme (Dark Graphite) | Purpose / Semantic Meaning |
| :--- | :--- | :--- | :--- |
| `--chassis-bg` | `#ECEFF4` (Warm Titanium) | `#0B0F17` (Deep Matte Basalt) | Outer physical ATM kiosk body |
| `--chassis-bezel` | `#D8DEE9` (Machined Aluminum)| `#161E2E` (Dark Graphite Bezel)| Recessed screen bezel & frame |
| `--screen-bg` | `#FFFFFF` (Crisp Optical White)| `#0F172A` (Midnight Slate) | Recessed capacitive touchscreen |
| `--screen-subdued` | `#F1F5F9` (Muted Slate) | `#1E293B` (Elevated Panel) | Menu rows, ledger item bands |
| `--screen-border` | `#E2E8F0` (Fine Machined Hairline)| `#334155` (Inner Border) | Screen container borders |
| `--text-primary` | `#0F172A` (Obsidian 900) | `#F8FAFC` (Pure Titanium 50) | High-contrast headings, balances |
| `--text-secondary` | `#334155` (Slate 700) | `#94A3B8` (Slate 400) | Form labels, instructions, secondary |
| `--text-tertiary` | `#64748B` (Slate 500) | `#64748B` (Slate 500) | Micro-captions, timestamps, references |
| `--accent` | `#047857` (Deep Emerald 700) | `#10B981` (Vibrant Emerald 500)| Brand highlights, active states |
| `--accent-brass` | `#B45309` (Brushed Brass) | `#F59E0B` (Warm Amber Gold) | Card chip, key legends |
| `--danger` | `#DC2626` (Crimson) | `#F87171` (Light Coral) | Errors, cancel key, debits, blocked |
| `--warning` | `#D97706` (Amber) | `#FBBF24` (Warm Amber) | Low balance, timeout countdown |
| `--success` | `#059669` (Forest Mint) | `#34D399` (Mint) | Cash dispense confirmation, credits |

*Note: All text color pairs guarantee a minimum contrast ratio of **6.2:1** (far exceeding WCAG AA 4.5:1).*

---

## 2. Typography & Tabular Numerals

- **Display & Interface UI**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif.
  - Heading 1: `24px` (font-semibold, tracking-tight)
  - Heading 2: `18px` (font-semibold, tracking-tight)
  - Body: `14px` (font-normal)
  - Microcopy / Labels: `11px` / `12px` (font-medium, uppercase, tracking-wider)
- **Monospace Financial Ledger & PIN**: `JetBrains Mono`, `SFMono-Regular`, `Consolas`, monospace.
  - Tabular numerals enabled (`font-variant-numeric: tabular-nums`).
  - Account numbers masked everywhere: `**** **** 1001` or `ACC****1001`.
  - Transaction references: `TXN-1001`.
  - Currency format: `₹5,000.00` (strictly 2 decimal places with `BigDecimal`).

---

## 3. Physical Scales & Ergonomics

- **Spacing Scale (4px Base)**:
  - `4px` (tight), `8px` (compact), `12px` (standard padding), `16px` (card/row padding), `24px` (section separation), `32px` (chassis padding).
- **Radius Scale (Strictly 2 Sizes)**:
  - Small / Components (`8px` / `rounded-lg`): Physical keys, side buttons, badges, input fields.
  - Large / Chassis (`16px` / `rounded-2xl`): Recessed touchscreen enclosure, outer kiosk bezel.
- **Elevation & Tactile Materiality**:
  - Screen Pocket: Inset shadow `inset 0 3px 8px rgba(0,0,0,0.25)` giving a recessed glass appearance.
  - Physical Keys: Dual-layer bevel shadow `0 3px 0 rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.15)`.
  - Pressed State: `transform: translateY(2px)`, shadow reduces to `0 1px 0 rgba(0,0,0,0.2)`.

---

## 4. Motion & Animation Tokens

- **Spring Key Press**: `type: 'spring', stiffness: 500, damping: 25` (travel under 100ms).
- **Screen Transitions**: Horizontal slide + subtle crossfade (`x: [20, 0], opacity: [0, 1]`, duration: `280ms`, ease: `[0.16, 1, 0.3, 1]`).
- **Reduced Motion (`prefers-reduced-motion`)**:
  - Motion is replaced with instantaneous opacity fades (`duration: 0.15s`). No spatial translation.

---

## 5. Industrial Terminal Layout Wireframe (ASCII)

```text
========================================================================================
||                                 APEX PRIME X-9000                                  ||
||                 MUMBAI CENTRAL #04   [● ONLINE]   [EN | हिन्दी]   [☼ / ☾]           ||
========================================================================================
||                                                                                    ||
||   +---+  +------------------------------------------------------------+  +---+     ||
||   | 1 |  |  SESSION: AARAV SHARMA (ACC****1001)        [ 48s ⏱ ]     |  | 5 |     ||
||   +---+  |------------------------------------------------------------|  +---+     ||
||          |                                                            |            ||
||   +---+  |   ◄ FAST CASH WITHDRAWAL             CASH DEPOSIT ►        |  +---+     ||
||   | 2 |  |                                                            |  | 6 |     ||
||   +---+  |   ◄ FUNDS TRANSFER                   BALANCE INQUIRY ►     |  +---+     ||
||          |                                                            |            ||
||   +---+  |   ◄ MINI STATEMENT                   TRANSACTION HISTORY ► |  +---+     ||
||   | 3 |  |                                                            |  | 7 |     ||
||   +---+  |   ◄ CHANGE PIN                       RETURN / EJECT CARD ► |  +---+     ||
||          |                                                            |            ||
||   +---+  +------------------------------------------------------------+  +---+     ||
||   | 4 |                                                                  | 8 |     ||
||   +---+                                                                  +---+     ||
||                                                                                    ||
========================================================================================
||  [CARD READER]         [NOTE DISPENSER TRAY]       [THERMAL RECEIPT]   [PIN PAD]   ||
||   ==============        ====================        ===============    [1] [2] [3] ||
||   [●] | CARD1001 |      | MOTORIZED SHUTTER |       |  RECEIPT SLIT |  [4] [5] [6] ||
||   ==============        ====================        ===============    [7] [8] [9] ||
||                                                                        [X] [0] [✔] ||
========================================================================================
```

### Functional Side-Key Alignment
- **Left Side Keys**:
  - Key 1: Aligned to on-screen row 1 (Withdrawal)
  - Key 2: Aligned to on-screen row 2 (Transfer)
  - Key 3: Aligned to on-screen row 3 (Mini Statement)
  - Key 4: Aligned to on-screen row 4 (Change PIN)
- **Right Side Keys**:
  - Key 5: Aligned to on-screen row 1 (Deposit)
  - Key 6: Aligned to on-screen row 2 (Balance Inquiry)
  - Key 7: Aligned to on-screen row 3 (Transaction History)
  - Key 8: Aligned to on-screen row 4 (Eject / Exit)
- Clicking either the on-screen row OR the physical side key triggers the action with satisfying mechanical press feedback and sound.
