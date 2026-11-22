# Team Member 4: Atharva — Frontend UI/UX, Hardware Simulation & Design System

> **Name**: Atharva  
> **Role Title**: Frontend Lead, Physical Kiosk Simulation & Design System Engineer  
> **Core Focus**: Touchscreen UI/UX, Tactile ATM Hardware Bay, Responsive Kiosk Enclosure, Interactive Card Engine & Accessibility  
> **Key Code Locations**: `frontend/src/components/atm/`, `frontend/src/components/cards/`, `frontend/src/components/layout/`, `frontend/src/pages/`, `frontend/src/index.css`, `frontend/src/test/`

---

## 1. Executive Summary & Contributions

Atharva led the design and implementation of the React 19 + Vite 6 + Tailwind CSS touchscreen interface. His focus was creating an authentic, sensory simulation of a physical automated teller kiosk (**Apex Prime X-9000**), complete with illuminated hardware slots, realistic currency notes, 3D interactive debit cards, procedural audio synthesis, and full WCAG 2.1 AA accessibility.

### Core Areas of Ownership:
1. **Physical Hardware Bay Simulation**: Developed the card reader slot, mechanical cash dispenser shutter, thermal receipt printer, and 3D numeric keypad.
2. **Interactive 3D Card Engine (`ApexCard.tsx`)**: Created the ISO/IEC 7810 debit card with accessible 3D flip animation, EMV smart chip, contactless symbol, and 6 custom visual themes.
3. **Design System & Shell Architecture**: Built the Warm Stone kiosk enclosure, Porcelain screen surfaces, typography scale, and responsive layout for mobile, tablet, and widescreen viewports.
4. **Sensory Sound Engine**: Programmed procedural audio feedback using the Web Audio API (`AudioContext`) for physical keypresses, card insertion, cash dispensing, and receipt printing.
5. **Frontend Automated Testing**: Authored 41 Vitest and React Testing Library tests verifying components, card themes, and transaction screens.

---

## 2. Detailed Technical Modules

### A. Physical ATM Hardware Bay Simulation (`frontend/src/components/atm/`)

#### 1. Beveled Card Slot (`CardSlot.tsx`)
- Multi-state LED indicator:
  - `empty`: Flashing green breathing pulse ("Insert Card").
  - `reading`: Rapid amber blink during chip communication.
  - `secured`: Steady emerald green throughout active session.
  - `blocked`: Solid crimson red indicator for revoked cards.
  - `ejected`: Alternating flashing alert reminding user to take card.

#### 2. Mechanical Cash Dispenser (`CashDispenserSlot.tsx`)
- Animated mechanical shutter door with emerald edge illumination.
- Authentic Indian Rupee banknotes:
  - **₹500 Note**: Stone green with red security thread and subtle geometric watermarks.
  - **₹200 Note**: Bright ochre with authentic micro-print badges.
  - **₹100 Note**: Lavender blue denomination badge.
- Interactive "Take Cash" collection button that updates the hardware context and triggers motor retract sounds.

#### 3. Thermal Receipt Printer & Document (`ReceiptPrinterSlot.tsx`, `ReceiptDocument.tsx`)
- Protruding thermal paper animation with realistic serrated tear edges.
- Thermal slip document featuring official Apex Bank vector brand marks, monospaced tabular numerals, masked account numbers, and transaction reference codes.
- Native `@media print` CSS: When the user clicks "Print Slip", standard browser printing styles isolate the receipt and hide the ATM kiosk background.

#### 4. 3D Tactile Numeric Keypad (`PhysicalKeypad.tsx`)
- High-contrast, tactile 3D beveled buttons with active depression states (`translate-y-0.5`).
- Synchronized with physical computer keyboard entry (Numbers 0–9, Enter = Proceed, Backspace = Clear, Escape = Cancel).
- Dual on-screen/hardware synchronization on the PIN entry page.

### B. Interactive Card Engine (`ApexCard.tsx`)
- **Strict Aspect Ratio**: Implements standard ISO/IEC 7810 ID-1 card dimensions (85.6 mm × 53.98 mm, aspect ratio 1.586:1).
- **Container-Query Sizing (`@container`)**: Ensures the card scales proportionally whether rendered in a small sidebar slot or a large welcome modal.
- **Accessible 3D Flip**: Includes an interactive flip toggle with `aria-pressed` states revealing the magnetic stripe, signature strip, and customer support disclosures without exposing sensitive CVV codes.
- **6 Visual Themes (`cardThemes.ts`)**: Institutional Black, Midnight Navy, Champagne Gold, Platinum Metallic, Emerald Wealth, and Rose Gold.

### C. Design Tokens & Styling (`index.css`, `tailwind.config.js`)
- **Warm Stone Enclosure**: `#1C1917` (Dark Enclosure) / `#E7E5E4` (Light Enclosure).
- **Porcelain Screen Background**: `#0B1220` (Dark Canvas) / `#F5F5F0` (Light Canvas).
- **IBM Plex Typography**: `IBM Plex Sans` for UI labels; `IBM Plex Mono` with tabular numerals (`tnum`) for account numbers, balances, and transaction timestamps.
- **Universal Focus Rings**: Accessible `:focus-visible` outlines with 2px accent outline and 2px offset across all interactive components.

### D. Procedural Audio Synthesis (`sound.ts`, `soundEffects.ts`)
- Zero external audio files (`.mp3`/`.wav`) that could fail to load over slow networks.
- Uses native browser Web Audio API `AudioContext` to generate procedural sound waves:
  - Keypad click: Dual sine wave burst (800 Hz + 1200 Hz).
  - Shutter motor: Low-frequency filtered brownian noise.
  - Dispenser cash rustle: High-frequency filtered noise burst.
  - Warning tone: Double beep (440 Hz).

---

## 3. Code Files Owned

- `frontend/src/components/atm/*` (all 6 hardware components)
- `frontend/src/components/cards/ApexCard.tsx`
- `frontend/src/components/layout/AtmKiosk.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/ui/*` (all shared UI primitives)
- `frontend/src/pages/*` (all 10 screen pages)
- `frontend/src/utils/cardThemes.ts`
- `frontend/src/utils/sound.ts` & `soundEffects.ts`
- `frontend/src/index.css` & `frontend/tailwind.config.js`
- `frontend/src/test/BrandAndCards.test.tsx`
- `frontend/src/test/AtmTerminal.test.tsx`
- `FRONTEND.md`

---

## 4. Viva & Presentation Talking Points

1. **How did you simulate physical hardware within a web browser?**  
   *Answer*: We modeled the terminal as a state-driven machine via `HardwareContext`. Hardware states (`cardSlotState`, `dispenserState`, `receiptState`) trigger synchronized CSS animations (shutter doors, paper ejection), visual LED changes, and Web Audio API procedural sound waves.
2. **Why use container queries (`@container`) instead of media queries for `ApexCard`?**  
   *Answer*: Media queries only respond to the viewport width. Because `ApexCard` is reused across different UI contexts (a narrow sidebar drawer vs. a large modal), container queries allow the card to size its chip, font size, and layout relative to its immediate parent container.
3. **How is the interface accessible for users with disabilities?**  
   *Answer*: It satisfies WCAG 2.1 AA standards: high contrast text, standard minimum touch targets (>= 44px), universal keyboard navigation with visible focus rings (`:focus-visible`), ARIA attributes (`aria-expanded`, `aria-pressed`, `aria-live`), and screen-reader safe thermal receipt dialogs.
