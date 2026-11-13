# Frontend UI & Animation Resources

This document records all UI component patterns, animation resources, and design inspirations used across the Modern ATM Banking Single Page Application, following the project specification.

---

## 1. Primary Animation Engine: Motion for React

- **Resource Name**: Motion for React (formerly Framer Motion)
- **Official Documentation**: [https://motion.dev/docs/react](https://motion.dev/docs/react)
- **Import Syntax**: `import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react'`
- **Implemented In**:
  - `frontend/src/components/ui/Button.tsx`: Spring physics button press (`whileHover`, `whileTap`, spring damping 25).
  - `frontend/src/components/ui/Keypad.tsx`: Haptic tactile feedback for numeric keypad keys.
  - `frontend/src/components/ui/NumberTicker.tsx`: Dynamic spring-interpolated balance counters.
  - `frontend/src/components/ui/Modal.tsx`: Accessible backdrop blur modals with entrance and exit transitions.
  - `frontend/src/components/atm/CardGraphic.tsx`: 3D perspective tilt on hover and metallic finish.
  - `frontend/src/components/atm/CashDispenser.tsx`: Smooth currency note slide-out and slide-in animations.
  - `frontend/src/pages/PinPage.tsx`: Interactive 4-dot PIN indicator and horizontal error shake animation (`x: [-12, 12, -10, 10, -6, 6, 0]`).
  - `frontend/src/pages/EjectPage.tsx`: Card ejection slot animation (sliding up out of terminal).
- **Dependencies**: `motion` (v12+)
- **License**: MIT License

---

## 2. Magic UI Inspired Components

- **Resource Name**: Magic UI
- **Source URL**: [https://magicui.design/](https://magicui.design/)
- **Components Used**:
  - **Number Ticker**:
    - *Source Pattern*: Magic UI Number Ticker component.
    - *Implementation*: `frontend/src/components/ui/NumberTicker.tsx`.
    - *Purpose*: Animates financial values (`₹5,000.00`, etc.) when loading dashboard, depositing, or withdrawing cash.
  - **Shimmer Button**:
    - *Source Pattern*: Magic UI Shimmer / Glow Button.
    - *Implementation*: `frontend/src/components/ui/Button.tsx` (variant: `'shimmer'`).
    - *Purpose*: High-priority ATM Call-To-Action buttons with gradient sweep animation.
- **Dependencies**: `motion`, `tailwindcss`
- **License**: MIT License

---

## 3. Aceternity UI Inspired Components

- **Resource Name**: Aceternity UI
- **Source URL**: [https://ui.aceternity.com/](https://ui.aceternity.com/)
- **Components Used**:
  - **3D Fintech Debit Card Widget**:
    - *Source Pattern*: 3D Card / Metallic gradient card with perspective hover.
    - *Implementation*: `frontend/src/components/atm/CardGraphic.tsx`.
    - *Purpose*: Visual representation of the customer's ATM card with EMV gold chip, contactless waves icon, status badges (Active/Expired/Blocked), and embossed account details.
  - **Glassmorphic Bento Grid**:
    - *Source Pattern*: Bento Grid layout with subtle border highlights.
    - *Implementation*: `frontend/src/pages/DashboardPage.tsx`.
    - *Purpose*: Clean 6-action touchscreen operation dashboard with glowing hover states.
- **Dependencies**: `motion`, `lucide-react`, `tailwindcss`
- **License**: MIT License

---

## 4. React Bits Components

- **Resource Name**: React Bits
- **Source URL**: [https://reactbits.dev/](https://reactbits.dev/)
- **Components Used**:
  - **TiltedCard**:
    - *Implementation*: `frontend/src/components/cards/TiltedATMCard.tsx`.
    - *Purpose*: Realistic 3D debit card with pointer-tracking tilt, specular gradient sheen (`--mouse-x`, `--mouse-y`), EMV chip, and contactless wave. Includes realistic mechanical slot insertion animation into reader slot.
  - **SpotlightCard**:
    - *Implementation*: `frontend/src/components/cards/SpotlightCard.tsx`.
    - *Purpose*: Pointer-following radial spotlight for the 6 ATM dashboard operations with dynamic coordinates and semantic fintech colors (Coral/Amber for Withdraw, Emerald/Mint for Deposit, Cobalt/Cyan for Transfer, Platinum for Balance, Silver for Activity, Violet for PIN).
  - **DecryptedText**:
    - *Implementation*: `frontend/src/components/ui/DecryptedText.tsx`.
    - *Purpose*: Sleek cryptographic character-by-character reveal for cardholder names and masked card identifiers upon authentication.
- **Dependencies**: `motion`, `lucide-react`, `tailwindcss`
- **License**: MIT License

---

## 5. Iconography: Lucide React

- **Resource Name**: Lucide React
- **Source URL**: [https://lucide.dev/](https://lucide.dev/)
- **Components Used**:
  - `Wallet`, `CreditCard`, `ArrowDownToLine`, `ArrowUpFromLine`, `ArrowLeftRight`, `History`, `KeyRound`, `LogOut`, `ShieldCheck`, `AlertCircle`, `CheckCircle2`, `RotateCcw`, `Delete`, `Printer`
- **Dependencies**: `lucide-react`
- **License**: ISC License

---

## 6. Self-Contained Implementation Guarantee

In compliance with section 4:
- All component source code is directly adapted and maintained inside `frontend/src/`.
- No runtime CDNs, external script tags, or remote stylesheet dependencies are required.
- The build is 100% self-contained and operates completely offline once built.

