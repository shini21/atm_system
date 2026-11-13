import React from 'react';
import { motion } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';

interface SideFunctionKeysProps {
  side: 'left' | 'right';
}

export const SideFunctionKeys: React.FC<SideFunctionKeysProps> = ({ side }) => {
  const { sideKeys, triggerSideKey } = useHardware();
  const isLeft = side === 'left';
  const keyIds = isLeft ? ['L1', 'L2', 'L3', 'L4'] : ['R1', 'R2', 'R3', 'R4'];

  return (
    <div
      aria-label={`${isLeft ? 'Left' : 'Right'} Function Keys`}
      className="hidden md:flex flex-col justify-around py-6 px-1 select-none"
    >
      {keyIds.map((keyId) => {
        const action = sideKeys[keyId];
        const isActive = !!action && !action.disabled;

        return (
          <div key={keyId} className="flex items-center my-1.5">
            <motion.button
              type="button"
              id={`atm-key-${keyId.toLowerCase()}`}
              aria-label={action?.label ? `${keyId}: ${action.label}` : `Function Key ${keyId}`}
              disabled={!isActive}
              whileTap={isActive ? { scale: 0.92, x: isLeft ? 3 : -3 } : undefined}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={() => {
                if (isActive) {
                  triggerSideKey(keyId);
                }
              }}
              className={`group relative flex items-center justify-center w-12 sm:w-14 h-12 rounded-lg border transition-all duration-150 ${
                isActive
                  ? 'cursor-pointer bg-gradient-to-b from-surface to-surface-subdued border-border-strong hover:border-accent shadow-sm hover:shadow'
                  : 'cursor-default opacity-40 bg-surface-subdued/60 border-border-subtle/50 shadow-none'
              }`}
              title={action?.label || `Key ${keyId}`}
            >
              {/* Outer bevel & metallic sheen */}
              <div className="absolute inset-0.5 rounded-[6px] bg-gradient-to-b from-white/10 to-black/10 pointer-events-none" />

              {/* Key Label */}
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <span
                  className={`text-[11px] font-mono font-bold tracking-wider ${
                    isActive
                      ? 'text-primary group-hover:text-accent'
                      : 'text-tertiary'
                  }`}
                >
                  {keyId}
                </span>

                {/* Status Indicator Pip */}
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-colors ${
                    isActive
                      ? 'bg-accent shadow-[0_0_6px_rgba(4,120,87,0.6)]'
                      : 'bg-transparent'
                  }`}
                />
              </div>

              {/* Directional Chevron pointing toward the screen */}
              {isLeft ? (
                <div
                  className={`absolute -right-1 text-[8px] transition-colors pointer-events-none ${
                    isActive ? 'text-accent font-bold' : 'text-transparent'
                  }`}
                >
                  ►
                </div>
              ) : (
                <div
                  className={`absolute -left-1 text-[8px] transition-colors pointer-events-none ${
                    isActive ? 'text-accent font-bold' : 'text-transparent'
                  }`}
                >
                  ◄
                </div>
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
};

