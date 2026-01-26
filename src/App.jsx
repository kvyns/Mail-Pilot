import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { useCreditStore } from './store/creditStore';
import './styles/tailwind.css';

function App() {
  const { initAuth, isAuthenticated } = useAuthStore();
  const { fetchBalance } = useCreditStore();
  
  useEffect(() => {
    // Initialize auth from localStorage
    initAuth();
  }, [initAuth]);
  
  useEffect(() => {
    // Fetch credits when authenticated
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, fetchBalance]);
  
  return <AppRoutes />;
}

export default App;
