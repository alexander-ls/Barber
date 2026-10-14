'use client';

import Particles, { useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';

export function initHalloweenParticles(engine: Engine) {
  return loadSlim(engine);
}

export function HalloweenParticles() {
  const { loaded: ready } = useParticlesProvider();
  if (!ready) return null;

  return (
    <Particles
      className="halloween-particles"
      options={{
        fullScreen: { enable: false },
        fpsLimit: 30,
        detectRetina: true,
        pauseOnBlur: true,
        pauseOnOutsideViewport: true,
        interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
        particles: {
          number: { value: 48, density: { enable: true, width: 1200, height: 800 } },
          color: { value: ['#ff9d32', '#ffc94a', '#b66aff', '#ff6b45'] },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.16, max: 0.72 }, animation: { enable: true, speed: 0.45, sync: false } },
          size: { value: { min: 1, max: 4 } },
          move: {
            enable: true,
            direction: 'top',
            speed: { min: 0.25, max: 0.9 },
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
          shadow: { enable: true, color: '#ff8b32', blur: 8 },
        },
      }}
    />
  );
}
