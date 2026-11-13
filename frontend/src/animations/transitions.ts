export const transitions = {
  springCrisp: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 25,
  },
  springBouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 18,
  },
  springGentle: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20,
  },
  cardTilt: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
    mass: 0.5,
  },
  smoothScreen: {
    duration: 0.35,
    ease: [0.2, 0.8, 0.2, 1] as const,
  },
  microInteraction: {
    duration: 0.15,
    ease: 'easeInOut' as const,
  },
};

