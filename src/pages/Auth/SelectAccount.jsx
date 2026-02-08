import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import { Building2, ChevronRight } from 'lucide-react';

const SelectAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectAccount } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  
  // Get accounts from location state (passed from login)
  const accounts = location.state?.accounts || [];
  const email = location.state?.email || '';
  
  // If no accounts available, redirect to login
  React.useEffect(() => {
    if (accounts.length === 0) {
      navigate('/login');
    }
  }, [accounts, navigate]);
  
  const handleSelectAccount = async (account) => {
    setSelectedAccountId(account.id);
    setIsLoading(true);
    
    try {
      await selectAccount(account);
      navigate('/dashboard');
    } catch (error) {
      console.error('Account selection error:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2">
            <span className="text-4xl">✈️</span>
            <span className="text-3xl font-bold text-gray-900">Mail Pilot</span>
          </div>
        </div>
        
        {/* Account Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Account</h2>
            <p className="text-gray-600">
              Multiple accounts found for <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">Choose the account you want to access</p>
          </div>
          
          {/* Accounts List */}
          <div className="space-y-3">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSelectAccount(account)}
                disabled={isLoading}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left group ${
                  selectedAccountId === account.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${
                      selectedAccountId === account.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    
                    {/* Account Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {account.businessName || 'Business Account'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {account.businessType || 'Business'} • {account.industry || 'General'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {account.companySize || 'Company'} • Account ID: {account.id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className={`ml-2 ${
                    selectedAccountId === account.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {isLoading && selectedAccountId === account.id ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
            >
              ← Back to Login
            </button>
          </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> You can switch between accounts anytime from the dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectAccount;
