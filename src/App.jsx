import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { useCreditStore } from './store/creditStore';
import './styles/tailwind.css';

function App() {
  const { initAuth, isAuthenticated, isInitialized } = useAuthStore();
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
  
  // Wait for auth initialization before rendering routes
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <AppRoutes />;
}

export default App;
