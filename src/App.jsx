import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import LockScreen from './pages/LockScreen';
import Main from './pages/Main';
import "./App.css";
import {
  STORAGE_KEY_UNLOCKED,
  STORAGE_UNLOCKED_VALUE,
  ROUTE_APP,
} from './config/constants';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem(STORAGE_KEY_UNLOCKED) === STORAGE_UNLOCKED_VALUE
  );

  const handleUnlock = useCallback(() => {
    // guarda en storage y actualiza estado para forzar re-render
    localStorage.setItem(STORAGE_KEY_UNLOCKED, STORAGE_UNLOCKED_VALUE);
    setIsUnlocked(true);
  }, []);

  return (
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
  );
}
