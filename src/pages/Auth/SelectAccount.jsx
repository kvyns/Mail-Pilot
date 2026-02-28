import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Building2, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';

const SelectAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectAccount, accounts: storeAccounts, isAuthenticated, selectedAccount: currentAccount } = useAuthStore();

  const [isLoading, setIsLoading]               = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [error, setError]                       = useState('');

  const accounts = location.state?.accounts?.length > 0
    ? location.state.accounts
    : storeAccounts || [];
  const email = location.state?.email || '';
  const isSwitching = isAuthenticated && !!currentAccount;

  React.useEffect(() => {
    if (accounts.length === 0) navigate('/login');
  }, [accounts, navigate]);

  const handleSelectAccount = async (account) => {
    const id = account.id || account._id || account.accountID;
    setSelectedAccountId(id);
    setIsLoading(true);
    setError('');
    try {
      const result = await selectAccount(account);
      if (!result.success) {
        setError(result.error || 'Could not switch account. Please log in again.');
        setIsLoading(false);
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isSwitching) navigate(-1);
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
              <img src="/mail-pilot-logo.png" alt="" className="w-7 h-7 object-contain"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <span className="text-white text-lg font-bold hidden">M</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Mail Pilot</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {isSwitching ? 'Switch Organization' : 'Choose Your Organization'}
            </h2>
            {email && (
              <p className="text-sm text-slate-500">
                Signed in as <span className="font-medium text-slate-800">{email}</span>
              </p>
            )}
            <p className="text-sm text-slate-400 mt-0.5">
              {accounts.length === 1 ? 'Select your organization to continue' : `${accounts.length} organizations available`}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-3">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-2">
                <span className="shrink-0">⚠</span>{error}
              </div>
            )}

            {accounts.map((account, idx) => {
              const acctId   = account.id || account._id || account.accountID;
              const isCurrent = currentAccount && (
                account.id === currentAccount.id ||
                account._id === currentAccount._id ||
                account.accountID === currentAccount.accountID
              );
              const isSelected = selectedAccountId === acctId;
              const isSpinning = isLoading && isSelected;
              const name = account.businessName || account.name || account.accountID || account.id || 'Business Account';

              return (
                <button key={acctId || idx} onClick={() => handleSelectAccount(account)}
                  disabled={isLoading}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all group
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : isCurrent
                      ? 'border-primary-200 bg-primary-50/50'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}
                    ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                        {name}
                        {isCurrent && (
                          <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {account.businessType || account.industry || 'Business'}
                        {acctId ? ` · ${acctId}` : ''}
                      </p>
                    </div>

                    <div className={`shrink-0 transition-colors ${isSelected ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`}>
                      {isSpinning
                        ? <div className="w-5 h-5 border-2 border-primary-400 border-t-primary-700 rounded-full animate-spin" />
                        : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-8 pb-7 text-center">
            <button onClick={handleCancel} disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium disabled:opacity-40 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isSwitching ? 'Back to Dashboard' : 'Back to Login'}
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-5 flex items-start gap-3 px-5 py-4 bg-white/70 backdrop-blur-sm border border-primary-100 rounded-2xl shadow-sm">
          <Sparkles className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Tip:</span>{' '}
            You can link more organizations and switch between them anytime from the top bar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectAccount;
