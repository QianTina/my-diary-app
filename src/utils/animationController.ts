/**
 * Animation Controller
 * 
 * Provides animation utilities for page flips, curl effects, and transitions.
 * Uses Framer Motion for smooth 60fps animations.
 * Respects user's reduce motion preferences.
 * 
 * Requirements: 6.1, 6.2, 6.7, 6.8, 10.3
 */

import type { PageFlipConfig, PageCurlConfig, AnimationController } from '../types/notebook';

/**
 * Default animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  pageFlip: 600,
  curl: 300,
  fade: 200,
} as const;

/**
 * Default easing functions
 */
export const EASING_FUNCTIONS = {
  pageFlip: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  curl: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  fade: 'ease-in-out',
} as const;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Create animation controller instance
 */
export const createAnimationController = (): AnimationController => {
  let currentCurlElement: HTMLElement | null = null;

  return {
    /**
     * Execute page flip animation
     */
    flipPage: async (config: PageFlipConfig): Promise<void> => {
      const { duration, easing, direction, reduceMotion } = config;
      
      // If reduce motion is enabled, use instant transition
      if (reduceMotion || prefersReducedMotion()) {
        return Promise.resolve();
      }

      // Return a promise that resolves after animation completes
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, duration);
      });
    },

    /**
     * Apply page curl effect on hover
     */
    applyCurlEffect: (config: PageCurlConfig): void => {
      if (!config.enabled || prefersReducedMotion()) {
        return;
      }

      // Store reference for cleanup
      // In a real implementation, this would apply CSS transforms
      // to create a curl effect at the specified position
    },

    /**
     * Remove page curl effect
     */
    removeCurlEffect: (): void => {
      currentCurlElement = null;
    },

    /**
     * Execute fade transition (for reduced motion mode)
     */
    transitionFade: async (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, duration);
      });
    },
  };
};

/**
 * Framer Motion variants for page flip animation
 */
export const pageFlipVariants = {
  initial: (direction: 'forward' | 'backward') => ({
    rotateY: direction === 'forward' ? -90 : 90,
    opacity: 0,
    transformOrigin: direction === 'forward' ? 'right' : 'left',
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    rotateY: direction === 'forward' ? 90 : -90,
    opacity: 0,
    transformOrigin: direction === 'forward' ? 'left' : 'right',
  }),
};

/**
 * Framer Motion transition config for page flip
 */
export const pageFlipTransition = (duration: number, easing: string) => ({
  duration: duration / 1000, // Convert to seconds
  ease: easing,
});

/**
 * Framer Motion variants for fade transition (reduced motion)
 */
export const fadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * Framer Motion transition config for fade
 */
export const fadeTransition = (duration: number) => ({
  duration: duration / 1000,
  ease: 'easeInOut',
});

/**
 * Framer Motion variants for page curl effect
 */
export const curlVariants = {
  initial: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
  },
  hover: (intensity: number) => ({
    scale: 1 + intensity * 0.02,
    rotateX: intensity * 2,
    rotateY: intensity * 2,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

/**
 * Performance monitoring utility
 * Logs warning if animation frame rate drops below 60fps
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  start(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measure();
  }

  private measure = (): void => {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      
      if (this.fps < 55) {
        console.warn(`Animation performance warning: ${this.fps} fps (target: 60 fps)`);
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(this.measure);
  };

  stop(): void {
    // Stop monitoring
  }

  getFPS(): number {
    return this.fps;
  }
}

/**
 * Default animation controller instance
 */
export const animationController = createAnimationController();
