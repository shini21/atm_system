import React from 'react';
import { useHardware } from '../../context/HardwareContext';
import { Delete, Check, X, RotateCcw } from 'lucide-react';

const KEY_BASE =
  'h-11 rounded-md flex flex-col items-center justify-center relative cursor-pointer select-none transition-[transform,box-shadow] duration-75 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ';
const keyStyle = (pressed: boolean, tone: 'stone' | 'cancel' | 'clear' | 'enter'): React.CSSProperties => {
  const bg = {
    stone: 'linear-gradient(180deg,#F3F6FA,#D8E0E8)',
    cancel: 'linear-gradient(180deg,#F5BABA,#D47070)',
    clear: 'linear-gradient(180deg,#E6EBF1,#C8D4E0)',
    enter: 'linear-gradient(180deg,#005BB5,#003B70)',
  }[tone];
  return {
    background: bg,
    color: tone === 'enter' ? '#fff' : '#202B38',
    boxShadow: pressed
      ? 'inset 0 2px 3px rgba(0,0,0,.35), 0 0 0 rgba(0,0,0,0)'
      : 'inset 0 1px 0 rgba(255,255,255,.75), 0 2px 0 rgba(17,18,20,.35), 0 3px 5px rgba(17,18,20,.18)',
    transform: pressed ? 'translateY(2px)' : undefined,
  };
};

/** Simulated physical PIN pad. Presses are routed through HardwareContext so the on-screen keypad stays in sync. */
export const PhysicalKeypad: React.FC = () => {
  const { pressKeypad, activeKeypadKey } = useHardware();

  return (
    <div className="flex flex-col items-center" role="group" aria-label="PIN pad (simulated)">
      <div className="w-full max-w-[240px] mb-1.5 px-0.5 flex justify-between items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-secondary uppercase">
        <span>PIN pad</span>
        <span className="font-normal normal-case tracking-normal text-tertiary">Simulated</span>
      </div>

      <div className="w-full max-w-[240px] p-2 rounded-lg select-none"
        style={{ background: 'linear-gradient(180deg,#B8C5D3,#9AAAC0)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 0 rgba(0,0,0,.2)' }}>
        <div className="grid grid-cols-3 gap-1.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" aria-label={`PIN pad ${d}`} onClick={() => pressKeypad(d)}
              className={KEY_BASE} style={keyStyle(activeKeypadKey === d, 'stone')}>
              <span className="text-base font-semibold font-mono leading-none">{d}</span>
              {d === '5' && <span aria-hidden="true" className="absolute bottom-1 w-1 h-1 rounded-full bg-black/50" />}
            </button>
          ))}
          <button type="button" aria-label="PIN pad cancel" title="Cancel (Esc)" onClick={() => pressKeypad('CANCEL')}
            className={KEY_BASE} style={keyStyle(activeKeypadKey === 'CANCEL', 'cancel')}>
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="text-[8px] font-semibold uppercase mt-0.5">Cancel</span>
          </button>
          <button type="button" aria-label="PIN pad 0" onClick={() => pressKeypad('0')}
            className={KEY_BASE} style={keyStyle(activeKeypadKey === '0', 'stone')}>
            <span className="text-base font-semibold font-mono leading-none">0</span>
          </button>
          <button type="button" aria-label="PIN pad clear" title="Clear" onClick={() => pressKeypad('CLEAR')}
            className={KEY_BASE} style={keyStyle(activeKeypadKey === 'CLEAR', 'clear')}>
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-[8px] font-semibold uppercase mt-0.5">Clear</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <button type="button" aria-label="PIN pad backspace" onClick={() => pressKeypad('BACKSPACE')}
            className={KEY_BASE.replace('h-11', 'h-9')} style={keyStyle(activeKeypadKey === 'BACKSPACE', 'stone')}>
            <span className="flex items-center gap-1 text-[10px] font-semibold"><Delete className="w-3.5 h-3.5" aria-hidden="true" />Back</span>
          </button>
          <button type="button" aria-label="PIN pad enter" title="Enter" onClick={() => pressKeypad('ENTER')}
            className={KEY_BASE.replace('h-11', 'h-9')} style={keyStyle(activeKeypadKey === 'ENTER', 'enter')}>
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"><Check className="w-3.5 h-3.5" aria-hidden="true" />Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
