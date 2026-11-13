import type { Variants } from 'motion/react';

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const screenTransitionVariants: Variants = {
  initial: (direction: number = 1) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.2, 0.8, 0.2, 1],
    },
  },
  exit: (direction: number = 1) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: [0.2, 0.8, 0.2, 1],
    },
  }),
};

export const cardInsertionVariants: Variants = {
  idle: {
    y: 0,
    opacity: 1,
    scale: 1,
    rotateX: 0,
  },
  inserting: {
    y: -48,
    scale: 0.88,
    opacity: 0.3,
    transition: {
      duration: 0.65,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

export const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.45 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

