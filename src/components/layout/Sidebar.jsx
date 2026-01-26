import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCreditStore } from '../../store/creditStore';
import { LayoutDashboard, Users, Mail, FileText, CreditCard, Settings, Plane } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { balance } = useCreditStore();
  
  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/dashboard/users', icon: Users },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: Mail },
    { name: 'Templates', path: '/dashboard/templates', icon: FileText },
    { name: 'Credits', path: '/dashboard/credits', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];
  
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="h-full bg-slate-900 text-white w-64 fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <Plane className="w-7 h-7 text-blue-500" />
          <span className="text-xl font-bold">Mail Pilot</span>
        </Link>
      </div>
      
      {/* Credits Display */}
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="text-sm font-medium text-slate-400">Available Credits</div>
        <div className="text-2xl font-bold text-blue-400">{balance.toLocaleString()}</div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email || ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
