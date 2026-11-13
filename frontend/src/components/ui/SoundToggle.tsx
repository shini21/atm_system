import React from 'react';
import { useHardware } from '../../context/HardwareContext';
import { Volume2, VolumeX } from 'lucide-react';

export const SoundToggle: React.FC = () => {
  const { isMuted, toggleSound } = useHardware();

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="p-1.5 rounded-full text-secondary hover:text-primary bg-surface-subdued hover:bg-surface-hover border border-border-subtle transition-all cursor-pointer select-none"
      title={isMuted ? 'Unmute ATM Sound Effects' : 'Mute ATM Sound Effects'}
    >
      {isMuted ? (
        <VolumeX className="w-3.5 h-3.5 text-tertiary" />
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-accent" />
      )}
    </button>
  );
};

