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

export default function App() {
  // Si la URL es exactamente http://localhost:3000/ borra el login guardado
  if (typeof window !== "undefined" && window.location.origin + window.location.pathname === "http://localhost:3000/") {
    localStorage.removeItem(STORAGE_KEY_UNLOCKED);
  }

  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem(STORAGE_KEY_UNLOCKED) === STORAGE_UNLOCKED_VALUE
  );

  const handleUnlock = useCallback(() => {
    // guarda en storage y actualiza estado para forzar re-render
    localStorage.setItem(STORAGE_KEY_UNLOCKED, STORAGE_UNLOCKED_VALUE);
    setIsUnlocked(true);
  }, []);

  // Referencia al audio para controlar el volumen y autoplay
  const audioRef = useRef(null);

  useEffect(() => {
    // Intenta reproducir el audio tras la primera interacción del usuario
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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isUnlocked ? <Navigate to={ROUTE_APP} replace /> : <LockScreen onUnlock={handleUnlock} />
            }
          />
          <Route
            path={ROUTE_APP}
            element={
              isUnlocked ? <Main /> : <Navigate to="/" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
