'use client';

import { useEffect, useState } from 'react';
import { Maximize2 } from 'lucide-react';

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be unavailable in some embedded browsers and must be started by the user.
    }
  }

  if (isFullscreen) return null;

  return (
    <button className="fullscreen-button" onClick={toggleFullscreen} type="button" aria-label="Ver en pantalla completa">
      <Maximize2 aria-hidden="true" />
      <span>Pantalla completa</span>
    </button>
  );
}
