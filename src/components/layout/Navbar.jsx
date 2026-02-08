import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../common/Button';
import { ChevronDown, Building2, Check } from 'lucide-react';

const Navbar = ({ title }) => {
  const navigate = useNavigate();
  const { logout, accounts, selectedAccount, selectAccount } = useAuthStore();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSwitchAccount = async (account) => {
    if (account.id !== selectedAccount?.id) {
      await selectAccount(account);
      setShowAccountMenu(false);
      // Optionally refresh the page or trigger data reload
      window.location.reload();
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      
      <div className="flex items-center space-x-4">
        {/* Account Switcher - Only show if multiple accounts */}
        {accounts && accounts.length > 1 && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span className="font-medium">
                {selectedAccount?.businessName || 'Select Account'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Switch Account</p>
                </div>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleSwitchAccount(account)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      selectedAccount?.id === account.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Building2 className={`w-4 h-4 flex-shrink-0 ${
                        selectedAccount?.id === account.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${
                          selectedAccount?.id === account.id ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {account.businessName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{account.industry}</p>
                      </div>
                    </div>
                    {selectedAccount?.id === account.id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
