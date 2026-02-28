import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useCreditStore } from '../../store/creditStore';
import { useCampaignStore } from '../../store/campaignStore';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import Loader from '../../components/common/Loader';
import {
  CreditCard, Mail, Users, BarChart3, FileText, ArrowRight,
  TrendingUp, TrendingDown, Minus, Zap, Send, Eye, MousePointerClick,
  Plus, ArrowUpRight, Clock,
} from 'lucide-react';

/* ─── tiny helpers ───────────────────────────────────────────── */
const Trend = ({ value }) => {
  if (value == null) return null;
  const up = value > 0;
  const flat = value === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${flat ? 'text-slate-400' : up ? 'text-green-600' : 'text-red-500'}`}>
      {flat ? <Minus className="w-3 h-3" /> : up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {flat ? '—' : `${up ? '+' : ''}${value}%`}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    sent:    'bg-green-100 text-green-700',
    draft:   'bg-slate-100 text-slate-600',
    active:  'bg-blue-100 text-blue-700',
    paused:  'bg-amber-100 text-amber-700',
    failed:  'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

/* ─── mock bar chart (CSS only) ─────────────────────────────── */
const MiniBarChart = ({ data = [] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary-500/80 hover:bg-primary-500 transition-all"
            style={{ height: `${(d.value / max) * 56}px` }}
            title={`${d.label}: ${d.value}`}
          />
        </div>
      ))}
    </div>
  );
};

/* ─── component ──────────────────────────────────────────────── */
const Overview = () => {
  const navigate = useNavigate();
  const { user, selectedAccount } = useAuthStore();
  const { balance, used, fetchBalance } = useCreditStore();
  const { campaigns, stats, fetchCampaigns, fetchStats } = useCampaignStore();
  const { users, fetchUsers } = useUserStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchBalance(), fetchCampaigns(), fetchStats(), fetchUsers()]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Overview">
        <Loader fullScreen text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  const firstName = user?.firstName || user?.name || 'there';
  const orgName = selectedAccount?.businessName || selectedAccount?.name || selectedAccount?.accountID || 'your organisation';

  const totalCredits = balance + used;
  const creditPct = totalCredits > 0 ? Math.round((balance / totalCredits) * 100) : 0;

  const kpiCards = [
    {
      label: 'Available Credits',
      value: balance.toLocaleString(),
      sub: `${used.toLocaleString()} used`,
      trend: null,
      icon: Zap,
      accent: 'bg-primary-600',
      light: 'bg-primary-50',
      iconColor: 'text-primary-600',
      extra: (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Usage</span>
            <span>{totalCredits > 0 ? 100 - creditPct : 0}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${totalCredits > 0 ? 100 - creditPct : 0}%` }} />
          </div>
        </div>
      ),
    },
    {
      label: 'Total Campaigns',
      value: (campaigns ?? []).length,
      sub: stats ? `${stats.sentCampaigns ?? 0} sent` : 'Loading...',
      trend: stats?.campaignTrend ?? null,
      icon: Send,
      accent: 'bg-blue-600',
      light: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Contacts',
      value: (users ?? []).length.toLocaleString(),
      sub: 'Active contacts',
      trend: stats?.usersTrend ?? null,
      icon: Users,
      accent: 'bg-violet-600',
      light: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Avg Open Rate',
      value: stats?.avgOpenRate != null ? `${stats.avgOpenRate}%` : '—',
      sub: 'Campaign performance',
      trend: stats?.openRateTrend ?? null,
      icon: Eye,
      accent: 'bg-emerald-600',
      light: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  const recentCampaigns = (campaigns ?? []).slice(0, 6);

  const chartData = recentCampaigns.length > 0
    ? recentCampaigns.map(c => ({ label: c.name, value: c.recipientsCount || 0 }))
    : [
        { label: 'Mon', value: 40 }, { label: 'Tue', value: 65 }, { label: 'Wed', value: 45 },
        { label: 'Thu', value: 80 }, { label: 'Fri', value: 55 }, { label: 'Sat', value: 70 },
        { label: 'Sun', value: 90 },
      ];

  const quickActions = [
    { label: 'New Campaign',  icon: Mail,     color: 'bg-primary-50 hover:bg-primary-100 text-primary-700', iconBg: 'bg-primary-600', path: '/dashboard/campaigns' },
    { label: 'New Template',  icon: FileText,  color: 'bg-blue-50 hover:bg-blue-100 text-blue-700',         iconBg: 'bg-blue-600',    path: '/dashboard/templates' },
    { label: 'Import Users',  icon: Users,     color: 'bg-violet-50 hover:bg-violet-100 text-violet-700',   iconBg: 'bg-violet-600',  path: '/dashboard/users' },
    { label: 'Buy Credits',   icon: CreditCard,color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700',iconBg: 'bg-emerald-600', path: '/dashboard/credits' },
  ];

  return (
    <DashboardLayout title="Overview">

      {/* ── Greeting ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's what's happening with <span className="font-semibold text-slate-700">{orgName}</span> today.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/campaigns')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {kpiCards.map(({ label, value, sub, trend, icon: Icon, accent, light, iconColor, extra }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${light} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              {trend != null && <Trend value={trend} />}
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
            {extra}
          </div>
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* Recent Campaigns — 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Campaigns</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest send activity</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentCampaigns.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium text-sm">No campaigns yet</p>
              <button
                onClick={() => navigate('/dashboard/campaigns')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Create first campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentCampaigns.map((c, i) => (
                <div key={c.id || i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.subject || '—'}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                    <span className="hidden sm:flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {(c.recipientsCount || 0).toLocaleString()}
                    </span>
                    {c.status === 'sent' && c.openRate != null && (
                      <span className="hidden md:flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {c.openRate}%
                      </span>
                    )}
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions — 1 col */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Common tasks</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, color, iconBg, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm ${color}`}
              >
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-center">{label}</span>
              </button>
            ))}
          </div>

          {/* Credits summary */}
          <div className="mx-4 mb-4 mt-2 p-4 bg-slate-950 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Zap className="w-3.5 h-3.5 text-primary-400" /> Credits remaining
              </div>
              <ArrowUpRight
                className="w-4 h-4 text-slate-500 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => navigate('/dashboard/credits')}
              />
            </div>
            <p className="text-2xl font-extrabold text-white">{balance.toLocaleString()}</p>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary-600 to-primary-400 rounded-full"
                style={{ width: `${totalCredits > 0 ? creditPct : 0}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{creditPct}% of purchased credits remaining</p>
          </div>
        </div>
      </div>

      {/* ── Activity bar chart ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campaign Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Recipients per campaign</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" /> Last {chartData.length} campaigns
          </div>
        </div>
        <MiniBarChart data={chartData} />
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-primary-500" />
            Recipients sent
          </div>
          {stats?.avgOpenRate != null && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
              Avg open rate: <span className="text-emerald-600 font-bold">{stats.avgOpenRate}%</span>
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Overview;
