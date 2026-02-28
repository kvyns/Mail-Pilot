import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import {
  ChevronDown, Building2, Check, Plus, Shield,
  Bell, Search, LogOut, User, Settings, ChevronRight, X,
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':            'Overview',
  '/dashboard/campaigns':  'Campaigns',
  '/dashboard/templates':  'Templates',
  '/dashboard/users':      'Users',
  '/dashboard/credits':    'Credits',
  '/dashboard/team':       'Team',
  '/dashboard/settings':   'Settings',
};

const Navbar = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, accounts, selectedAccount, selectAccount, user } = useAuthStore();
  const { roleMeta } = usePermissions();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const accountMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) setShowAccountMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getId = (a) => a?.id || a?._id || a?.accountID;

  const handleSwitchAccount = async (account) => {
    if (getId(account) !== getId(selectedAccount)) {
      await selectAccount(account);
      setShowAccountMenu(false);
      window.location.reload();
    } else {
      setShowAccountMenu(false);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    setConfirmLogout(true);
  };

  const doLogout = async () => {
    setConfirmLogout(false);
    await logout();
    navigate('/login');
  };

  const orgName =
    selectedAccount?.businessName || selectedAccount?.name ||
    selectedAccount?.accountID || selectedAccount?.id ||
    accounts?.[0]?.businessName || accounts?.[0]?.accountID || 'My Organization';

  const userInitial = (user?.firstName || user?.name || 'U').charAt(0).toUpperCase();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.name || 'User';

  const pageTitle = title || PAGE_TITLES[location.pathname] || 'Dashboard';
  const pathParts = location.pathname.replace('/dashboard', '').split('/').filter(Boolean);

  return (
    <>
    {confirmLogout && (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmLogout(false)}>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-900">Sign Out</h3>
            <button onClick={() => setConfirmLogout(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-5">Are you sure you want to sign out of Mail Pilot?</p>
          <div className="flex gap-2.5">
            <button onClick={() => setConfirmLogout(false)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">Cancel</button>
            <button onClick={doLogout} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors">Sign Out</button>
          </div>
        </div>
      </div>
    )}
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">

      {/* ── Left: Breadcrumb ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`font-medium ${pathParts.length ? 'text-slate-400 hover:text-slate-600 cursor-pointer' : 'text-slate-900 font-bold text-base'}`}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </span>
        {pathParts.map((part, i) => (
          <React.Fragment key={i}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`capitalize font-semibold ${i === pathParts.length - 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* ── Right: Controls ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Org Switcher */}
        <div className="relative" ref={accountMenuRef}>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <span className="font-medium max-w-36 truncate hidden sm:block">{orgName}</span>
            <span className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleMeta.color}`}>
              <Shield className="w-3 h-3" />{roleMeta.label}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Your Organisations
              </p>
              <div className="max-h-56 overflow-y-auto">
                {(accounts || []).map((account) => {
                  const id = getId(account);
                  const isActive = getId(selectedAccount) === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSwitchAccount(account)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group ${isActive ? 'bg-primary-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                          {(account.businessName || account.name || account.accountID || 'O').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary-700' : 'text-slate-800'}`}>
                            {account.businessName || account.name || account.accountID || 'Organization'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{account.roleTitle || `ID: ${id}`}</p>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => { setShowAccountMenu(false); navigate('/dashboard/settings?tab=organizations'); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-2 rounded-b-2xl"
                >
                  <Plus className="w-4 h-4" /> Link another organisation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
              {userInitial}
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden md:block max-w-28 truncate">{displayName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden md:block ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/dashboard/settings'); }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Settings
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-b-2xl"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
