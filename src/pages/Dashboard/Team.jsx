import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { useAuthStore } from '../../store/authStore';
import { usersAPI } from '../../api';
import { isValidEmail } from '../../utils/validators';
import {
  UserPlus, Shield, User, Eye, CheckCircle, CheckCircle2, Mail,
  Pencil, Trash2, RefreshCw, Users, Crown, AlertCircle,
} from 'lucide-react';

/* ─── Role definitions ─────────────────────────────────────── */
const ROLES = [
  { id: 'super-admin', name: 'Super Admin', description: 'Full access to all features, settings and billing',  icon: Crown,   color: 'text-purple-600', bgColor: 'bg-purple-50',  badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'admin',       name: 'Admin',       description: 'Manage users, campaigns and account settings',       icon: Shield,  color: 'text-blue-600',   bgColor: 'bg-blue-50',    badge: 'bg-blue-100    text-blue-700   border-blue-200'   },
  { id: 'manager',     name: 'Manager',     description: 'Create and manage campaigns and templates',          icon: User,    color: 'text-emerald-600',bgColor: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'},
  { id: 'member',      name: 'Member',      description: 'Create campaigns and view reports',                  icon: Users,   color: 'text-slate-600',  bgColor: 'bg-slate-100',  badge: 'bg-slate-100   text-slate-700   border-slate-200'  },
  { id: 'viewer',      name: 'Viewer',      description: 'View-only access to campaigns and reports',         icon: Eye,     color: 'text-slate-500',  bgColor: 'bg-slate-100',  badge: 'bg-slate-100   text-slate-600   border-slate-200'  },
];

const getRoleInfo = (roleId) =>
  ROLES.find(r => r.id === roleId) || { id: roleId, name: roleId || 'Member', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: User, color: 'text-slate-500', bgColor: 'bg-slate-100' };

/* ─── Toast ─────────────────────────────────────────────────── */
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

/* ─── Role Picker ───────────────────────────────────────────── */
const RolePicker = ({ value, onChange }) => (
  <div className="space-y-2">
    {ROLES.map(role => {
      const Icon = role.icon;
      const active = value === role.id;
      return (
        <button key={role.id} type="button" onClick={() => onChange(role.id)}
          className={`w-full p-3 rounded-xl border-2 text-left transition-all
            ${active ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-200 hover:bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${active ? role.bgColor + ' ' + role.color : 'bg-slate-100 text-slate-500'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{role.name}</p>
              <p className="text-xs text-slate-500">{role.description}</p>
            </div>
            {active && <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />}
          </div>
        </button>
      );
    })}
  </div>
);

/* ─── Main ──────────────────────────────────────────────────── */
const Team = () => {
  const { user, selectedAccount, userAccess } = useAuthStore();

  const accountID = selectedAccount?.accountID || selectedAccount?.id || selectedAccount?._id || user?.accountID || user?.accountId;
  const orgName   = selectedAccount?.businessName || selectedAccount?.name || user?.businessName || user?.name || 'Your Organization';
  const userRoleID = userAccess?.roleID || selectedAccount?.roleID || selectedAccount?.role || '';
  const isSuperAdmin = ['super-admin', 'admin'].includes(userRoleID) || !!accountID;

  const [toasts, setToasts]   = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  /* Invite */
  const [showInvite, setShowInvite]     = useState(false);
  const [inviteStep, setInviteStep]     = useState(1);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm]     = useState({ email: '', role: '' });
  const [inviteErrors, setInviteErrors] = useState({});

  /* Change role */
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleTarget, setRoleTarget]       = useState(null);
  const [selectedRole, setSelectedRole]   = useState('');
  const [roleLoading, setRoleLoading]     = useState(false);

  /* Remove */
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget]       = useState(null);
  const [removeLoading, setRemoveLoading]     = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const loadMembers = async () => {
    if (!accountID) return;
    setIsLoading(true); setPageError('');
    try {
      const response = await usersAPI.getAll({ accountID });
      const data = response?.users ?? response?.data ?? response ?? [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setPageError(err?.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, [accountID]);

  /* ── Invite ── */
  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm(p => ({ ...p, [name]: value }));
    if (inviteErrors[name]) setInviteErrors(p => ({ ...p, [name]: '' }));
  };

  const validateInvite = () => {
    const errs = {};
    if (!inviteForm.email) errs.email = 'Email is required';
    else if (!isValidEmail(inviteForm.email)) errs.email = 'Invalid email address';
    if (!inviteForm.role) errs.role = 'Please select a role';
    setInviteErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendInvite = async () => {
    if (!validateInvite()) return;
    setInviteLoading(true);
    const chosenRole = ROLES.find(r => r.id === inviteForm.role);
    try {
      await usersAPI.invite({ email: inviteForm.email, roleID: inviteForm.role, roleTitle: chosenRole?.name || inviteForm.role, accountID });
      setInviteStep(2);
    } catch (err) {
      setInviteErrors({ submit: err?.message || 'Failed to send invitation' });
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    const wasSuccess = inviteStep === 2;
    setShowInvite(false); setInviteStep(1);
    setInviteForm({ email: '', role: '' }); setInviteErrors({});
    if (wasSuccess) loadMembers();
  };

  /* ── Change role ── */
  const openRoleModal = (member) => { setRoleTarget(member); setSelectedRole(member.role || member.roleID || ''); setShowRoleModal(true); };

  const handleSaveRole = async () => {
    if (!selectedRole || !roleTarget) return;
    setRoleLoading(true);
    try {
      await usersAPI.update(roleTarget.id || roleTarget._id, { role: selectedRole, roleID: selectedRole });
      setMembers(p => p.map(m => (m.id || m._id) === (roleTarget.id || roleTarget._id) ? { ...m, role: selectedRole, roleID: selectedRole } : m));
      setShowRoleModal(false);
      addToast(`Role updated to ${getRoleInfo(selectedRole).name}.`);
    } catch (err) {
      addToast(err?.message || 'Failed to update role.', 'error');
    } finally {
      setRoleLoading(false);
    }
  };

  /* ── Remove ── */
  const openRemoveModal = (member) => { setRemoveTarget(member); setShowRemoveModal(true); };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      await usersAPI.delete(removeTarget.id || removeTarget._id);
      setMembers(p => p.filter(m => (m.id || m._id) !== (removeTarget.id || removeTarget._id)));
      setShowRemoveModal(false);
      addToast(`${memberName(removeTarget)} removed from team.`);
    } catch (err) {
      addToast(err?.message || 'Failed to remove member.', 'error');
      setShowRemoveModal(false);
    } finally {
      setRemoveLoading(false);
    }
  };

  const memberName = (m) =>
    m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || '—';

  /* Stats */
  const adminCount   = members.filter(m => ['super-admin','admin'].includes(m.role || m.roleID)).length;
  const activeCount  = members.filter(m => m.status === 'active' || m.emailVerified).length;
  const pendingCount = members.filter(m => m.status === 'pending' || m.status === 'invited').length;

  const stats = [
    { label: 'Total Members', value: members.length,  icon: Users,   color: 'text-primary-600 bg-primary-50' },
    { label: 'Admins',        value: adminCount,       icon: Crown,   color: 'text-purple-600 bg-purple-50'  },
    { label: 'Active',        value: activeCount,      icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending',       value: pendingCount,     icon: Mail,    color: 'text-amber-600 bg-amber-50'    },
  ];

  return (
    <DashboardLayout title="Team">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orgName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadMembers} disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </button>
          {isSuperAdmin && (
            <button onClick={() => { setShowInvite(true); setInviteStep(1); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors">
              <UserPlus className="w-4 h-4" />Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
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

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Team Members</h2>
          <p className="text-sm text-slate-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>

        {pageError && (
          <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{pageError}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-1">No team members yet</h3>
            <p className="text-sm text-slate-500 mb-6">Invite your first team member to get started.</p>
            {isSuperAdmin && (
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors">
                <UserPlus className="w-4 h-4" />Invite First Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Member','Role','Status','Joined', ...(isSuperAdmin ? ['Actions'] : [])].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(member => {
                  const role = getRoleInfo(member.role || member.roleID);
                  const RoleIcon = role.icon || User;
                  const isCurrentUser = member.email === user?.email;
                  const isActive = member.status === 'active' || member.emailVerified;
                  const isPending = member.status === 'pending' || member.status === 'invited';
                  return (
                    <tr key={member.id || member._id || member.email} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
                            {memberName(member).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                              {memberName(member)}
                              {isCurrentUser && <span className="text-xs text-slate-400 font-normal">(you)</span>}
                            </p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${role.badge}`}>
                          <RoleIcon className="w-3 h-3" />{role.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${isActive ? 'bg-emerald-100 text-emerald-700' : isPending ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : isPending ? 'bg-amber-400' : 'bg-slate-400'}`} />
                          {isActive ? 'Active' : isPending ? 'Invited' : member.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {(member.createdOn || member.createdAt)
                          ? new Date(member.createdOn || member.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-4 text-right">
                          {!isCurrentUser && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openRoleModal(member)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />Role
                              </button>
                              <button onClick={() => openRemoveModal(member)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />Remove
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Invite Modal ── */}
      <Modal isOpen={showInvite} onClose={closeInviteModal}
        title={inviteStep === 1 ? 'Invite Team Member' : 'Invitation Sent'} size="md">
        {inviteStep === 1 ? (
          <div className="space-y-5 py-1">
            {inviteErrors.submit && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{inviteErrors.submit}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" name="email" value={inviteForm.email} onChange={handleInviteChange}
                  placeholder="colleague@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition
                    ${inviteErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
              </div>
              {inviteErrors.email && <p className="mt-1 text-xs text-red-600">{inviteErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role <span className="text-red-500">*</span></label>
              <RolePicker value={inviteForm.role} onChange={v => { setInviteForm(p => ({ ...p, role: v })); if (inviteErrors.role) setInviteErrors(p => ({ ...p, role: '' })); }} />
              {inviteErrors.role && <p className="mt-1 text-xs text-red-600">{inviteErrors.role}</p>}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={closeInviteModal}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleSendInvite} disabled={inviteLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white transition-colors">
                {inviteLoading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</>
                  : <><UserPlus className="w-4 h-4" />Send Invitation</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Invitation Sent!</h3>
            <p className="text-slate-500 mb-1">An activation email has been sent to</p>
            <p className="font-semibold text-slate-900 mb-5">{inviteForm.email}</p>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-left mb-5">
              <p className="text-sm font-semibold text-primary-900 mb-2">Role assigned:</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleInfo(inviteForm.role).badge}`}>
                {getRoleInfo(inviteForm.role).name}
              </span>
            </div>
            <button onClick={closeInviteModal}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors">
              Done
            </button>
          </div>
        )}
      </Modal>

      {/* ── Change Role Modal ── */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)}
        title={`Change Role — ${memberName(roleTarget || {})}`} size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRoleModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleSaveRole}
              disabled={roleLoading || !selectedRole || selectedRole === (roleTarget?.role || roleTarget?.roleID)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white transition-colors">
              {roleLoading ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : 'Save Role'}
            </button>
          </div>
        }>
        <div className="py-1">
          <RolePicker value={selectedRole} onChange={setSelectedRole} />
        </div>
      </Modal>

      {/* ── Remove Confirmation Modal ── */}
      <Modal isOpen={showRemoveModal} onClose={() => setShowRemoveModal(false)}
        title="Remove Team Member" size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRemoveModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleRemoveMember} disabled={removeLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white transition-colors">
              {removeLoading
                ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Removing…</>
                : <><Trash2 className="w-3.5 h-3.5" />Remove</>}
            </button>
          </div>
        }>
        <p className="text-slate-600 py-2">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-slate-900">{memberName(removeTarget || {})}</span>{' '}
          from your team? They will lose access to this account.
        </p>
      </Modal>
    </DashboardLayout>
  );
};

export default Team;
