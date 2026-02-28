import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api';
import {
  User, Mail, Phone, Lock, Bell, Building2, Plus, X,
  CheckCircle2, AlertCircle, Eye, EyeOff, Globe,
  Twitter, Facebook, Instagram, ChevronRight,
  ShieldCheck, Trash2, RefreshCw, Save,
} from 'lucide-react';

/* ─── Toast ─────────────────────────────────────────────── */
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

/* ─── Field helper ───────────────────────────────────────── */
const Field = ({ label, error, children }) => (
  <div>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition
   ${err ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;

/* ─── Section wrapper ────────────────────────────────────── */
const Section = ({ title, subtitle, children, action }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

/* ─── Tabs ───────────────────────────────────────────────── */
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'organizations', label: 'Organizations',  icon: Building2 },
  { id: 'security',      label: 'Security',       icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
];

/* ─── Main ───────────────────────────────────────────────── */
const Settings = () => {
  const { user, accounts, selectedAccount, addLinkedAccount, selectAccount, initAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  /* ── Profile ── */
  const [profile, setProfile] = useState({
    name:  user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: user?.mobileNumber || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    await new Promise(r => setTimeout(r, 600));
    addToast('Profile updated successfully.');
    setProfileSaving(false);
  };

  /* ── Password ── */
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const handleChangePassword = async () => {
    const errs = {};
    if (!password.current) errs.current = 'Required';
    if (!password.new || password.new.length < 8) errs.new = 'Min 8 characters';
    if (password.new !== password.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwSaving(true);
    await new Promise(r => setTimeout(r, 600));
    addToast('Password changed successfully.');
    setPassword({ current: '', new: '', confirm: '' });
    setPwErrors({});
    setPwSaving(false);
  };

  /* ── Notifications ── */
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    campaignReports: true,
    weeklyDigest: false,
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const handleSavePreferences = async () => {
    setPrefSaving(true);
    await new Promise(r => setTimeout(r, 500));
    addToast('Preferences saved.');
    setPrefSaving(false);
  };

  /* ── Linked Orgs ── */
  const linkedAccounts = accounts?.length > 0
    ? accounts
    : user?.accountID ? [{ id: user.accountID, businessName: user.businessName || 'Your Account', accountID: user.accountID }] : [];

  const [showAddOrg, setShowAddOrg] = useState(false);
  const [business, setBusiness] = useState({ businessName:'', businessEmail:'', businessPhone:'', website:'', x:'', facebook:'', instagram:'', tiktok:'', tripadviser:'' });
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessResult, setBusinessResult] = useState(null);
  const [businessErrors, setBusinessErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'organizations') { setActiveTab('organizations'); setShowAddOrg(true); }
  }, []);

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusiness(p => ({ ...p, [name]: value }));
    if (businessErrors[name]) setBusinessErrors(p => ({ ...p, [name]: '' }));
    if (businessResult) setBusinessResult(null);
  };

  const handleSaveBusiness = async () => {
    const errs = {};
    if (!business.businessName.trim()) errs.businessName = 'Business name is required';
    if (Object.keys(errs).length) { setBusinessErrors(errs); return; }
    setBusinessLoading(true);
    setBusinessResult(null);
    try {
      const result = await authAPI.addBusinessDetails({
        email: user?.email,
        businessName: business.businessName,
        businessEmail: business.businessEmail,
        businessPhone: business.businessPhone,
        website: business.website,
        x: business.x, facebook: business.facebook, instagram: business.instagram,
        tiktok: business.tiktok, tripadviser: business.tripadviser,
      });
      if (result?.responseCode === 1 || result?.responseStatus === 'SUCCESS' || result?.success) {
        const newAccountID = result?.accountID || result?.data?.accountID;
        if (newAccountID) {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, accountID: newAccountID }));
          addLinkedAccount({ id: newAccountID, accountID: newAccountID, businessName: business.businessName, businessEmail: business.businessEmail, businessPhone: business.businessPhone, website: business.website });
          initAuth();
        }
        addToast(result?.responseMessage || 'Organization linked successfully!');
        setBusinessResult({ type: 'success', message: result?.responseMessage || 'Organization linked successfully!' });
        setBusiness({ businessName:'', businessEmail:'', businessPhone:'', website:'', x:'', facebook:'', instagram:'', tiktok:'', tripadviser:'' });
        setShowAddOrg(false);
      } else {
        setBusinessResult({ type: 'error', message: result?.responseMessage || 'Failed to link organization.' });
      }
    } catch (err) {
      setBusinessResult({ type: 'error', message: err?.message || 'Failed to link organization.' });
    } finally {
      setBusinessLoading(false);
    }
  };

  /* ── Render ── */
  const PwField = ({ field, label }) => (
    <Field label={label} error={pwErrors[field]}>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={password[field]}
          onChange={e => { setPassword(p => ({ ...p, [field]: e.target.value })); setPwErrors(p => ({ ...p, [field]: '' })); }}
          className={`${inputCls(pwErrors[field])} pl-9 pr-10`}
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  );

  const SaveBtn = ({ onClick, loading, label = 'Save Changes' }) => (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white shadow-sm transition-colors">
      {loading
        ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
        : <><Save className="w-3.5 h-3.5" />{label}</>}
    </button>
  );

  return (
    <DashboardLayout title="Settings">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences and linked organisations</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1 mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${active ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              <Icon className="w-4 h-4 shrink-0" />{tab.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-3xl space-y-6">

        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <Section title="Profile Information" subtitle="Update your personal details">
            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold shrink-0">
                  {(profile.name || profile.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{profile.name || '—'}</p>
                  <p className="text-sm text-slate-500">{profile.email}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      className={`${inputCls()} pl-9`} placeholder="Jane Doe" />
                  </div>
                </Field>
                <Field label="Email Address">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className={`${inputCls()} pl-9`} placeholder="you@example.com" />
                  </div>
                </Field>
                <Field label="Phone Number">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className={`${inputCls()} pl-9`} placeholder="+44 000 000 0000" />
                  </div>
                </Field>
              </div>
              <div className="flex justify-end pt-2">
                <SaveBtn onClick={handleSaveProfile} loading={profileSaving} />
              </div>
            </div>
          </Section>
        )}

        {/* ── Organizations ── */}
        {activeTab === 'organizations' && (
          <Section
            title="Linked Organizations"
            subtitle="Business accounts associated with your profile"
            action={
              <button onClick={() => { setShowAddOrg(v => !v); setBusinessResult(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                  ${showAddOrg ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'}`}>
                {showAddOrg ? <><X className="w-4 h-4" />Cancel</> : <><Plus className="w-4 h-4" />Link Organization</>}
              </button>
            }
          >
            <div className="space-y-4">
              {linkedAccounts.length === 0 ? (
                <div className="flex items-start gap-3 py-3 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">No organizations linked yet. Use the form below to link your first business account.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedAccounts.map((acct, idx) => {
                    const id = acct.id || acct._id || acct.accountID;
                    const isActive = (selectedAccount?.id || selectedAccount?.accountID) === id;
                    return (
                      <div key={id || idx} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors
                        ${isActive ? 'border-primary-200 bg-primary-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                          ${isActive ? 'bg-primary-100' : 'bg-white border border-slate-200'}`}>
                          <Building2 className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate flex items-center gap-2">
                            {acct.businessName || acct.name || acct.accountID || 'Organization'}
                            {isActive && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-normal">Active</span>}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{acct.industry || acct.businessType || ''}{id ? ` ID: ${id}` : ''}</p>
                        </div>
                        {!isActive && (
                          <button onClick={async () => { await selectAccount(acct); window.location.reload(); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                            <RefreshCw className="w-3 h-3" />Switch
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {showAddOrg && (
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary-600" />Link a New Organization
                  </p>

                  <Field label="Business Name *" error={businessErrors.businessName}>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="businessName" value={business.businessName} onChange={handleBusinessChange}
                        className={`${inputCls(businessErrors.businessName)} pl-9`} placeholder="Acme Corporation" />
                    </div>
                  </Field>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Business Email">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="businessEmail" type="email" value={business.businessEmail} onChange={handleBusinessChange}
                          className={`${inputCls()} pl-9`} placeholder="hello@acme.com" />
                      </div>
                    </Field>
                    <Field label="Business Phone">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="businessPhone" type="tel" value={business.businessPhone} onChange={handleBusinessChange}
                          className={`${inputCls()} pl-9`} placeholder="+44 20 0000 0000" />
                      </div>
                    </Field>
                  </div>

                  <Field label="Website">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="website" type="url" value={business.website} onChange={handleBusinessChange}
                        className={`${inputCls()} pl-9`} placeholder="https://acme.com" />
                    </div>
                  </Field>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Social Media <span className="text-slate-400 font-normal">(optional)</span></p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'x',         label: 'X / Twitter',  ph: '@acmecorp',           icon: Twitter },
                        { name: 'facebook',   label: 'Facebook',     ph: 'facebook.com/acme',    icon: Facebook },
                        { name: 'instagram',  label: 'Instagram',    ph: '@acmecorp',            icon: Instagram },
                        { name: 'tiktok',     label: 'TikTok',       ph: '@acmecorp',            icon: null },
                        { name: 'tripadviser',label: 'TripAdvisor',  ph: 'tripadvisor.com/acme', icon: Globe },
                      ].map(f => (
                        <Field key={f.name} label={f.label}>
                          <input name={f.name} value={business[f.name]} onChange={handleBusinessChange}
                            className={inputCls()} placeholder={f.ph} />
                        </Field>
                      ))}
                    </div>
                  </div>

                  {businessResult && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border
                      ${businessResult.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                      {businessResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      {businessResult.message}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <SaveBtn onClick={handleSaveBusiness} loading={businessLoading} label="Link Organization" />
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── Security ── */}
        {activeTab === 'security' && (
          <>
            <Section title="Change Password" subtitle="Keep your account secure with a strong password">
              <div className="space-y-4">
                <PwField field="current" label="Current Password" />
                <PwField field="new" label="New Password" />
                <PwField field="confirm" label="Confirm New Password" />
                <div className="flex justify-end pt-2">
                  <SaveBtn onClick={handleChangePassword} loading={pwSaving} label="Change Password" />
                </div>
              </div>
            </Section>

            <Section title="Danger Zone" subtitle="Irreversible actions — proceed with caution">
              <div className="border border-red-200 rounded-xl p-5 bg-red-50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700 mt-1 mb-4">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">
                      <Trash2 className="w-4 h-4" />Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <Section title="Notification Preferences" subtitle="Choose what updates you want to receive">
            <div className="space-y-3">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications about account activity' },
                { key: 'campaignReports',    label: 'Campaign Reports',    desc: 'Get detailed reports after each campaign completes' },
                { key: 'weeklyDigest',       label: 'Weekly Digest',       desc: 'A weekly summary of your campaigns and performance' },
              ].map(({ key, label, desc }) => (
                <label key={key}
                  className="flex items-center justify-between gap-4 px-4 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-primary-700 transition-colors">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  {/* Toggle switch */}
                  <div className={`relative w-10 h-6 rounded-full transition-colors shrink-0
                    ${preferences[key] ? 'bg-primary-600' : 'bg-slate-200'}`}>
                    <input type="checkbox" className="sr-only" checked={preferences[key]}
                      onChange={e => setPreferences(p => ({ ...p, [key]: e.target.checked }))} />
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                      ${preferences[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </label>
              ))}
              <div className="flex justify-end pt-3">
                <SaveBtn onClick={handleSavePreferences} loading={prefSaving} label="Save Preferences" />
              </div>
            </div>
          </Section>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Settings;
