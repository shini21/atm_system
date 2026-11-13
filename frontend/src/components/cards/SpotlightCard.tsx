import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

interface SpotlightCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  desc: string;
  icon: React.ReactNode;
  spotlightColor?: string;
  onClick?: () => void;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  title,
  desc,
  icon,
  spotlightColor = '#3B82F6',
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <motion.button
      ref={cardRef}
      type="button"
      disabled={disabled}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={
        {
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`,
          '--spotlight-color': spotlightColor,
        } as React.CSSProperties
      }
      className={`relative p-5 rounded-2xl bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-left transition-all cursor-pointer flex items-start gap-4 select-none group shadow-xs overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      {...(props as any)}
    >
      {/* Dynamic Pointer Spotlight Glow Layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? (isDark ? 0.16 : 0.08) : 0,
          background: `radial-gradient(circle 140px at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%)`,
        }}
      />

      {/* Subtle Border Spotlight Layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border transition-opacity duration-300"
        style={{
          opacity: isHovered ? (isDark ? 0.35 : 0.25) : 0,
          borderColor: 'var(--spotlight-color)',
        }}
      />

      {/* Semantic Icon Enclosure */}
      <div
        className="relative z-10 w-11 h-11 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-xs"
        style={{
          color: isHovered ? spotlightColor : undefined,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="font-semibold text-sm text-primary group-hover:text-primary transition-colors flex items-center justify-between">
          <span>{title}</span>
          <span
            className="text-xs transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: spotlightColor }}
          >
            →
          </span>
        </div>
        <div className="text-xs text-secondary mt-1 leading-relaxed">
          {desc}
        </div>
      </div>
    </motion.button>
  );
};

