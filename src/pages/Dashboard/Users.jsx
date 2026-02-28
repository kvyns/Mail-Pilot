import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useUserStore } from '../../store/userStore';
import { parseCSV } from '../../utils/csvParser';
import { parseExcel } from '../../utils/excelParser';
import {
  Users as UsersIcon, UserPlus, Upload, Trash2, Search, X,
  CheckCircle2, AlertCircle, Mail, User, ShieldCheck,
} from 'lucide-react';

/* ─── Toast ── */
const Toast = ({ toasts }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto
        ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
        {t.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {t.message}
      </div>
    ))}
  </div>
);

/* ─── Confirm Modal ── */
const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-slate-200" onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s ease-out' }}>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
};

/* ─── Add Contact Modal ── */
const AddModal = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!open) return null;
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Both name and email are required.'); return; }
    setLoading(true);
    const result = await onAdd(form);
    setLoading(false);
    if (result?.success) { setForm({ name: '', email: '' }); setError(''); onClose(); }
    else setError(result?.error || 'Failed to add contact.');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200" onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s ease-out' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary-600" />Add Contact</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Jane Doe"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="jane@example.com"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white transition-colors">
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Adding…</> : <><UserPlus className="w-4 h-4" />Add Contact</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
};

/* ─── Import Modal ── */
const ImportModal = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!open) return null;
  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setError('');
    try {
      let data;
      if (f.name.endsWith('.csv')) data = await parseCSV(f);
      else if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) data = await parseExcel(f);
      else { setError('Unsupported file type. Please use CSV or Excel.'); return; }
      setPreview(data.slice(0, 5));
    } catch (err) { setError('Error parsing file: ' + err.message); }
  };
  const handleClose = () => { setFile(null); setPreview(null); setError(''); onClose(); };
  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const result = await onImport(file);
    setLoading(false);
    if (result.success) { handleClose(); }
    else setError(result.error || 'Import failed.');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-slate-200 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s ease-out' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Upload className="w-5 h-5 text-primary-600" />Import Contacts</h2>
          <button onClick={handleClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload CSV or Excel File</label>
            <label className={`flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${file ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50/50'}`}>
              <Upload className={`w-8 h-8 ${file ? 'text-primary-500' : 'text-slate-400'}`} />
              <span className="text-sm font-medium text-slate-700">{file ? file.name : 'Click to choose a file'}</span>
              <span className="text-xs text-slate-500">CSV, XLSX, XLS supported</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
            </label>
          </div>
          {preview && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Preview — first {preview.length} rows</p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{k}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(row).map((v, j) => <td key={j} className="px-4 py-2 text-slate-700">{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleImport} disabled={!file || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white transition-colors">
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Importing…</> : <><Upload className="w-4 h-4" />Import</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
};

/* ─── Main ── */
const Users = () => {
  const { users, isLoading, fetchUsers, addUser, deleteUser, importUsers, filters, setFilters } = useUserStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteUser(confirmDelete.id);
    addToast(`"${confirmDelete.name || confirmDelete.email}" deleted.`);
    setConfirmDelete(null);
  };

  const handleImport = async (file) => {
    const result = await importUsers(file);
    if (result.success) addToast(result.data?.message || 'Contacts imported successfully.');
    else addToast(result.error || 'Import failed.', 'error');
    return result;
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const stats = [
    { label: 'Total Contacts', value: users.length, icon: UsersIcon, color: 'text-primary-600 bg-primary-50' },
    { label: 'Active', value: activeCount, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Inactive', value: users.length - activeCount, icon: User, color: 'text-slate-600 bg-slate-100' },
    { label: 'Showing', value: users.filter(u => (u.name || '').toLowerCase().includes((filters.search || '').toLowerCase()) || (u.email || '').toLowerCase().includes((filters.search || '').toLowerCase())).length, icon: Search, color: 'text-amber-600 bg-amber-50' },
  ];

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes((filters.search || '').toLowerCase()) ||
    (u.email || '').toLowerCase().includes((filters.search || '').toLowerCase())
  );

  return (
    <DashboardLayout title="Contacts">
      <Toast toasts={toasts} />
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Contact"
        message={`Remove "${confirmDelete?.name || confirmDelete?.email}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <AddModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addUser} />
      <ImportModal open={showImport} onClose={() => setShowImport(false)} onImport={handleImport} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} total contact{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors">
            <UserPlus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email…"
            value={filters.search || ''}
            onChange={e => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
          {filters.search && (
            <button onClick={() => setFilters({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading contacts…</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-1">{filters.search ? 'No contacts match your search' : 'No contacts yet'}</h3>
            <p className="text-sm text-slate-500 mb-6">{filters.search ? 'Try a different keyword.' : 'Add your first contact to get started.'}</p>
            {!filters.search && (
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors">
                <UserPlus className="w-4 h-4" /> Add Contact
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
                          {(u.name || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full
                        ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setConfirmDelete(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
