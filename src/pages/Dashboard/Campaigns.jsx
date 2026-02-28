import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import { useCampaignStore } from '../../store/campaignStore';
import { useTemplateStore } from '../../store/templateStore';
import { useUserStore } from '../../store/userStore';
import { useCreditStore } from '../../store/creditStore';
import {
  Mail, BarChart3, MousePointerClick, Users, Send, Plus,
  Trash2, Search, Filter, ChevronDown, Eye, Zap, X,
  AlertTriangle, CheckCircle, Clock, FileText, TrendingUp,
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    sent:    { cls: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500',  label: 'Sent' },
    draft:   { cls: 'bg-slate-100 text-slate-600 border-slate-200',   dot: 'bg-slate-400',  label: 'Draft' },
    active:  { cls: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500',   label: 'Active' },
    sending: { cls: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500',  label: 'Sending' },
    failed:  { cls: 'bg-red-100 text-red-600 border-red-200',         dot: 'bg-red-500',    label: 'Failed' },
    paused:  { cls: 'bg-orange-100 text-orange-700 border-orange-200',dot: 'bg-orange-400', label: 'Paused' },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-xl font-extrabold text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── Confirm Modal ───────────────────────────────────────────── */
const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm mx-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-amber-600'}`} />
        </div>
        <h3 className="text-base font-bold text-slate-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Create Campaign Modal ───────────────────────────────────── */
const CreateModal = ({ open, onClose, templates, users, onSubmit, isLoading }) => {
  const [form, setForm] = useState({ name: '', subject: '', templateId: '' });
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Campaign name is required';
    if (!form.subject.trim()) e.subject = 'Subject line is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, recipientsCount: users.length });
    setForm({ name: '', subject: '', templateId: '' });
  };

  const field = (label, key, placeholder, type = 'text') => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${errors[key] ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Campaign</h2>
              <p className="text-xs text-slate-400">Set up your email campaign</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {field('Campaign Name', 'name', 'e.g. Spring Newsletter 2026')}
          {field('Subject Line', 'subject', 'e.g. 🌸 Big news — just for you!')}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template <span className="text-slate-400 font-normal">(optional)</span></label>
            <select
              value={form.templateId}
              onChange={e => set('templateId', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
            >
              <option value="">— No template —</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Recipients summary */}
          {users.length > 0 && (
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{users.length.toLocaleString()} recipients</p>
                <p className="text-xs text-slate-400">Will cost <span className="font-bold text-primary-600">{users.length.toLocaleString()} credits</span></p>
              </div>
              <Zap className="w-4 h-4 text-primary-400 shrink-0" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors">
            {isLoading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : <><Plus className="w-4 h-4" />Create Campaign</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const Campaigns = () => {
  const navigate = useNavigate();
  const { campaigns, isLoading, fetchCampaigns, createCampaign, sendCampaign, deleteCampaign } = useCampaignStore();
  const { templates, fetchTemplates } = useTemplateStore();
  const { users, fetchUsers } = useUserStore();
  const { balance, deductCredits } = useCreditStore();

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmSend, setConfirmSend] = useState(null);   // campaign object
  const [confirmDelete, setConfirmDelete] = useState(null); // campaign id
  const [sending, setSending] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchUsers();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async (data) => {
    setCreating(true);
    const result = await createCampaign(data);
    setCreating(false);
    if (result.success) {
      setShowCreate(false);
      showToast('success', 'Campaign created successfully!');
    } else {
      showToast('error', result.error || 'Failed to create campaign.');
    }
  };

  const handleSend = async () => {
    if (!confirmSend) return;
    const campaign = confirmSend;
    setConfirmSend(null);
    if (balance < campaign.recipientsCount) {
      showToast('error', `Insufficient credits. Need ${campaign.recipientsCount}, have ${balance}.`);
      return;
    }
    setSending(campaign.id);
    const result = await sendCampaign(campaign.id);
    if (result.success) {
      await deductCredits(campaign.recipientsCount, `Campaign: ${campaign.name}`);
      showToast('success', 'Campaign sent successfully!');
    } else {
      showToast('error', result.error || 'Failed to send campaign.');
    }
    setSending(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    await deleteCampaign(id);
    showToast('success', 'Campaign deleted.');
  };

  const filtered = useMemo(() => {
    let list = campaigns ?? [];
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (search.trim()) list = list.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [campaigns, statusFilter, search]);

  const sentCampaigns = (campaigns ?? []).filter(c => c.status === 'sent');
  const avgOpenRate = sentCampaigns.length
    ? (sentCampaigns.reduce((s, c) => s + (c.openRate || 0), 0) / sentCampaigns.length).toFixed(1)
    : null;
  const avgClickRate = sentCampaigns.length
    ? (sentCampaigns.reduce((s, c) => s + (c.clickRate || 0), 0) / sentCampaigns.length).toFixed(1)
    : null;

  return (
    <DashboardLayout title="Campaigns">

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">{(campaigns ?? []).length} campaigns total · {sentCampaigns.length} sent</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Mail}              label="Total Campaigns"  value={(campaigns ?? []).length}    color="bg-primary-600" />
        <Stat icon={Send}              label="Sent"             value={sentCampaigns.length}         color="bg-green-600" />
        <Stat icon={Eye}               label="Avg Open Rate"    value={avgOpenRate ? `${avgOpenRate}%` : '—'} color="bg-violet-600" />
        <Stat icon={MousePointerClick} label="Avg Click Rate"   value={avgClickRate ? `${avgClickRate}%` : '—'} color="bg-blue-600" />
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'draft', 'sent', 'active', 'failed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">
              {search || statusFilter !== 'all' ? 'No campaigns match your filters' : 'No campaigns yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {search || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first campaign to start sending emails.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Campaign
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Campaign</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Recipients</div>
              <div className="col-span-1 text-right">Open %</div>
              <div className="col-span-1 text-right">Click %</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Rows */}
            {filtered.map((c, i) => (
              <div
                key={c.id || i}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group"
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.subject || '—'}</p>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <StatusBadge status={c.status} />
                </div>

                <div className="col-span-1 text-right">
                  <span className="text-sm font-medium text-slate-700">{(c.recipientsCount || 0).toLocaleString()}</span>
                </div>

                <div className="col-span-1 text-right">
                  {c.status === 'sent' && c.openRate != null
                    ? <span className="text-sm font-semibold text-violet-600">{c.openRate}%</span>
                    : <span className="text-slate-300 text-sm">—</span>}
                </div>

                <div className="col-span-1 text-right">
                  {c.status === 'sent' && c.clickRate != null
                    ? <span className="text-sm font-semibold text-blue-600">{c.clickRate}%</span>
                    : <span className="text-slate-300 text-sm">—</span>}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2">
                  {c.status === 'draft' && (
                    <button
                      onClick={() => setConfirmSend(c)}
                      disabled={sending === c.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {sending === c.id
                        ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Send className="w-3.5 h-3.5" />}
                      Send
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <CreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        templates={templates}
        users={users}
        onSubmit={handleCreate}
        isLoading={creating}
      />

      <ConfirmModal
        open={!!confirmSend}
        title="Send Campaign?"
        message={confirmSend ? `Send "${confirmSend.name}" to ${confirmSend.recipientsCount?.toLocaleString()} recipients? This will use ${confirmSend.recipientsCount?.toLocaleString()} credits.` : ''}
        confirmLabel="Send Now"
        onConfirm={handleSend}
        onClose={() => setConfirmSend(null)}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Campaign?"
        message="This action cannot be undone. The campaign will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />

    </DashboardLayout>
  );
};

export default Campaigns;
