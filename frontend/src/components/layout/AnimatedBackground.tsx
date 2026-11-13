import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-canvas transition-colors duration-200">
      {/* Subtle radial ambient highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-gradient-to-b from-accent-subtle to-transparent opacity-40 blur-3xl" />
    </div>
  );
};
