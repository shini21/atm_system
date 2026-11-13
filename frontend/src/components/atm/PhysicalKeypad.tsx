import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { Delete, Check, X, RotateCcw } from 'lucide-react';

export const PhysicalKeypad: React.FC = () => {
  const { pressKeypad } = useHardware();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Listen for physical keyboard events to mirror physical keypad presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key = '';
      if (/^[0-9]$/.test(e.key)) {
        key = e.key;
      } else if (e.key === 'Backspace') {
        key = 'BACKSPACE';
      } else if (e.key === 'Escape') {
        key = 'CANCEL';
      } else if (e.key === 'Enter') {
        key = 'ENTER';
      } else if (e.key === 'Delete' || e.key === 'c' || e.key === 'C') {
        key = 'CLEAR';
      }

      if (key) {
        setActiveKey(key);
        pressKeypad(key);
        setTimeout(() => setActiveKey(null), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressKeypad]);

  const handlePress = (key: string) => {
    setActiveKey(key);
    pressKeypad(key);
    setTimeout(() => setActiveKey(null), 150);
  };

  const keys = [
    { label: '1', sub: 'QZ', value: '1' },
    { label: '2', sub: 'ABC', value: '2' },
    { label: '3', sub: 'DEF', value: '3' },
    { label: '4', sub: 'GHI', value: '4' },
    { label: '5', sub: 'JKL', value: '5', braille: true },
    { label: '6', sub: 'MNO', value: '6' },
    { label: '7', sub: 'PRS', value: '7' },
    { label: '8', sub: 'TUV', value: '8' },
    { label: '9', sub: 'WXY', value: '9' },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Label */}
      <div className="w-full max-w-[240px] mb-1.5 px-1 flex justify-between items-center gap-2 text-[10px] font-mono tracking-wider text-tertiary uppercase">
        <span className="truncate">Hardware PIN Pad</span>
        <span className="text-[9px] text-tertiary whitespace-nowrap opacity-80">PCI-PTS v6</span>
      </div>

      {/* Keypad Base Enclosure */}
      <div className="w-full max-w-[240px] p-2 rounded-xl bg-surface-subdued border border-border-subtle shadow-inner select-none">
        <div className="grid grid-cols-3 gap-1.5">
          {/* Numbers 1-9 */}
          {keys.map((k) => (
            <motion.button
              key={k.value}
              type="button"
              whileTap={{ scale: 0.92, y: 1 }}
              onClick={() => handlePress(k.value)}
              className={`h-11 rounded-lg bg-gradient-to-b from-surface to-surface-subdued border border-border-subtle hover:border-accent/40 shadow-sm flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                activeKey === k.value ? 'ring-2 ring-accent scale-95' : ''
              }`}
            >
              <span className="text-sm font-bold font-mono text-primary leading-none">
                {k.label}
              </span>
              <span className="text-[7px] font-mono text-tertiary leading-none mt-0.5 tracking-tighter">
                {k.sub}
              </span>
              {/* Tactile Braille Dot on Key 5 */}
              {k.braille && (
                <div className="absolute right-1 bottom-1 w-1 h-1 rounded-full bg-tertiary" />
              )}
            </motion.button>
          ))}

          {/* Row 4: Cancel [Red], 0, Clear [Yellow] */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92, y: 1 }}
            onClick={() => handlePress('CANCEL')}
            className={`h-11 rounded-lg bg-gradient-to-b from-rose-950/40 to-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-300 shadow-sm flex flex-col items-center justify-center cursor-pointer ${
              activeKey === 'CANCEL' ? 'ring-2 ring-rose-500 scale-95' : ''
            }`}
            title="Cancel Transaction (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="text-[7px] font-mono font-semibold tracking-tighter uppercase mt-0.5">
              Cancel
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92, y: 1 }}
            onClick={() => handlePress('0')}
            className={`h-11 rounded-lg bg-gradient-to-b from-surface to-surface-subdued border border-border-subtle hover:border-accent/40 shadow-sm flex flex-col items-center justify-center cursor-pointer ${
              activeKey === '0' ? 'ring-2 ring-accent scale-95' : ''
            }`}
          >
            <span className="text-sm font-bold font-mono text-primary leading-none">0</span>
            <span className="text-[7px] font-mono text-tertiary leading-none mt-0.5">OPER</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92, y: 1 }}
            onClick={() => handlePress('CLEAR')}
            className={`h-11 rounded-lg bg-gradient-to-b from-amber-950/40 to-amber-900/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 shadow-sm flex flex-col items-center justify-center cursor-pointer ${
              activeKey === 'CLEAR' ? 'ring-2 ring-amber-500 scale-95' : ''
            }`}
            title="Clear Input (Del)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[7px] font-mono font-semibold tracking-tighter uppercase mt-0.5">
              Clear
            </span>
          </motion.button>
        </div>

        {/* Enter / Confirm Bar */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => handlePress('BACKSPACE')}
            className={`h-9 rounded-lg bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-secondary shadow-sm flex items-center justify-center gap-1 cursor-pointer text-xs font-mono ${
              activeKey === 'BACKSPACE' ? 'ring-2 ring-accent scale-95' : ''
            }`}
          >
            <Delete className="w-3.5 h-3.5" />
            <span className="text-[9px] font-semibold">BKSP</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => handlePress('ENTER')}
            className={`h-9 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/50 text-white shadow-sm flex items-center justify-center gap-1 cursor-pointer text-xs font-mono font-semibold ${
              activeKey === 'ENTER' ? 'ring-2 ring-emerald-300 scale-95' : ''
            }`}
            title="Enter / Confirm (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="text-[9px] tracking-wider uppercase">ENTER</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

