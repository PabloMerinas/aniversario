import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useCallback, useState, useRef, useEffect } from 'react';
import LockScreen from './pages/LockScreen';
import Main from './pages/Main';
import "./App.css";
import {
  STORAGE_KEY_UNLOCKED,
  STORAGE_UNLOCKED_VALUE,
  ROUTE_APP,
} from './config/constants';
import cancionFondo from './assets/audio/cancion-fondo.mp3';
import { ANIVERSARIO_DATE } from './config/constants';

export default function App() {
  // Estado de desbloqueo leído desde localStorage
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem(STORAGE_KEY_UNLOCKED) === STORAGE_UNLOCKED_VALUE
  );

  const handleUnlock = useCallback(() => {
    // Guarda en storage y actualiza estado para forzar re-render
    localStorage.setItem(STORAGE_KEY_UNLOCKED, STORAGE_UNLOCKED_VALUE);
    setIsUnlocked(true);
  }, []);

  // Referencia al audio para controlar el volumen y autoplay
  const audioRef = useRef(null);

  useEffect(() => {
    // Reproducir el audio tras la primera interacción del usuario
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.18;
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
    };
    window.addEventListener('pointerdown', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });
    window.addEventListener('touchstart', tryPlay, { once: true });
    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
    };
  }, []);

  // ¿Aún no ha llegado la fecha del aniversario?
  const isBeforeAnniversary = new Date() < ANIVERSARIO_DATE;

  // Si aún no es el aniversario y la app está "desbloqueada", fuerza el lock y limpia la misma clave usada para el unlock
  useEffect(() => {
    if (isBeforeAnniversary && isUnlocked) {
      setIsUnlocked(false);
      localStorage.removeItem(STORAGE_KEY_UNLOCKED);
    }
  }, [isBeforeAnniversary, isUnlocked]);

  return (
    <>
      {/* Audio de fondo global */}
      <audio
        ref={audioRef}
        src={cancionFondo}
        autoPlay
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      {/* Si despliegas en subcarpeta, deja el basename (p.ej. GitHub Pages) */}
      <BrowserRouter basename="/aniversario">
        <Routes>
          {/* Login en "/" */}
          <Route
            path="/"
            element={
              (isUnlocked && !isBeforeAnniversary)
                ? <Navigate to={ROUTE_APP} replace />
                : <LockScreen onUnlock={handleUnlock} />
            }
          />
          {/* Ruta protegida de la app */}
          <Route
            path={ROUTE_APP}
            element={
              (isUnlocked && !isBeforeAnniversary)
                ? <Main />
                : <Navigate to="/" replace />
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
