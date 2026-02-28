import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCreditStore } from '../../store/creditStore';
import { usePermissions } from '../../hooks/usePermissions';
import {
  LayoutDashboard, Users, Users2, Mail, FileText,
  CreditCard, ShieldAlert, Zap,
} from 'lucide-react';

const allNavItems = [
  { name: 'Overview',   path: '/dashboard',           icon: LayoutDashboard, permission: 'view:overview' },
  { name: 'Campaigns',  path: '/dashboard/campaigns', icon: Mail,            permission: 'view:campaigns' },
  { name: 'Templates',  path: '/dashboard/templates', icon: FileText,        permission: 'view:templates' },
  { name: 'Users',      path: '/dashboard/users',     icon: Users,           permission: 'view:users' },
  { name: 'Credits',    path: '/dashboard/credits',   icon: CreditCard,      permission: 'view:credits' },
  { name: 'Team',       path: '/dashboard/team',      icon: Users2,          permission: 'view:team' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, selectedAccount } = useAuthStore();
  const { balance } = useCreditStore();
  const { can, roleMeta, isActive: accessActive } = usePermissions();

  const navigation = allNavItems.filter(item => can(item.permission));

  const orgName =
    selectedAccount?.businessName ||
    selectedAccount?.name ||
    selectedAccount?.accountID ||
    selectedAccount?.id ||
    user?.businessName ||
    user?.name ||
    'My Account';

  const userInitial = (user?.firstName || user?.name || 'U').charAt(0).toUpperCase();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.name || 'User';

  const isActivePath = (path) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="h-full bg-slate-950 text-white w-64 fixed left-0 top-0 flex flex-col border-r border-slate-800/60">

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-5 h-5" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">Mail Pilot</span>
        </Link>
      </div>

      {/* ── Org + Credits ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-800/60 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-900 border border-primary-700/50 flex items-center justify-center shrink-0">
            <span className="text-primary-300 text-xs font-bold">{orgName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{orgName}</p>
            <p className="text-xs text-slate-500">Organisation</p>
          </div>
        </div>

        {/* Credits bar */}
        <div className="bg-slate-900 rounded-xl px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary-400" /> Credits
            </span>
            <span className="text-sm font-bold text-primary-400">{balance.toLocaleString()}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary-600 to-primary-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (balance / 10000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map(({ path, name, icon: Icon }) => {
          const active = isActivePath(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{name}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* ── User / Footer ─────────────────────────────────────────────── */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-800/60 space-y-2">
        {!accessActive && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-950/60 border border-red-800/50 rounded-xl text-xs text-red-400">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Access inactive
          </div>
        )}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{displayName}</p>
            <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${roleMeta.color}`}>
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
