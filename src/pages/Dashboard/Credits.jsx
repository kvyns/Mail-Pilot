import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { useCreditStore } from '../../store/creditStore';
import { useAuthStore } from '../../store/authStore';
import {
  CreditCard, Tag, CheckCircle, CheckCircle2, RefreshCw, Receipt,
  AlertCircle, Zap, TrendingUp, ShoppingCart, ChevronRight, Sparkles,
} from 'lucide-react';

/* ─── Fallback packages ────────────────────────────────────── */
const FALLBACK_PACKAGES = [
  { packageId: 'starter',      amount: 1000,  price: 10,  label: 'Starter' },
  { packageId: 'professional', amount: 5000,  price: 45,  label: 'Professional', popular: true },
  { packageId: 'business',     amount: 10000, price: 80,  label: 'Business' },
  { packageId: 'enterprise',   amount: 50000, price: 350, label: 'Enterprise' },
];

/* ─── Toast ────────────────────────────────────────────────── */
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

/* ─── Status styles ────────────────────────────────────────── */
const STATUS_STYLE = {
  paid:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  success:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending:     'bg-amber-100   text-amber-700   border-amber-200',
  unpaid:      'bg-amber-100   text-amber-700   border-amber-200',
  processing:  'bg-blue-100    text-blue-700    border-blue-200',
  failed:      'bg-red-100     text-red-700     border-red-200',
  cancelled:   'bg-red-100     text-red-700     border-red-200',
  canceled:    'bg-red-100     text-red-700     border-red-200',
  refunded:    'bg-purple-100  text-purple-700  border-purple-200',
};

/* ─── Main ─────────────────────────────────────────────────── */
const Credits = () => {
  const {
    balance, used, total, history, isLoading, packages,
    fetchBalance, fetchTransactions, fetchPackages, initiateCheckout, applyVoucher,
  } = useCreditStore();
  const { user } = useAuthStore();

  const [toasts, setToasts]               = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [voucherCode, setVoucherCode]     = useState('');
  const [voucherResult, setVoucherResult] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError]   = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [txLoading, setTxLoading]         = useState(false);

  const displayPackages = packages?.length > 0 ? packages : FALLBACK_PACKAGES;

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    fetchBalance();
    refreshTransactions();
    fetchPackages();
  }, []);

  const refreshTransactions = async () => {
    setTxLoading(true);
    await fetchTransactions();
    setTxLoading(false);
  };

  /* Normalise transaction */
  const normalise = (tx) => {
    const pkg        = typeof tx.package === 'object' && tx.package !== null ? tx.package : {};
    const pkgTitle   = typeof tx.package === 'string' ? tx.package : (pkg.title || '');
    const rawStatus  = (tx.paymentStatus || tx.status || tx.state || 'unknown').toUpperCase();
    const stripped   = rawStatus.replace(/^PAYMENT_/, '');
    const STATUS_MAP = { PROCESSING:'processing', CANCELLED:'cancelled', CANCELED:'cancelled', SUCCESS:'paid', COMPLETE:'paid', COMPLETED:'paid', PAID:'paid', FAILED:'failed', PENDING:'pending', UNPAID:'unpaid', REFUNDED:'refunded' };
    const status      = STATUS_MAP[stripped] || stripped.toLowerCase();
    const statusLabel = stripped.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const sanitiseName = (n) => (n || '').replace(/\bundefined\b/gi, '').replace(/\s+/g, ' ').trim();
    const payerObj   = tx.payer || {};
    const rawName    = tx.payerName || `${payerObj.firstName || ''} ${payerObj.lastName || ''}`;
    const authName   = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const payerName  = authName || sanitiseName(rawName) || '';
    const payerEmail = tx.payerEmail || payerObj.email || tx.email || user?.email || '';
    const payer      = payerName || payerEmail;
    return {
      id:          tx.transactionID || tx.transactionId || tx.id || tx._id || '',
      date:        tx.paymentDate   || tx.createdOn     || tx.createdAt || tx.date || tx.updatedOn || null,
      title:       pkgTitle         || tx.description   || tx.label     || tx.packageName || 'Credit Purchase',
      credits:     Number(pkg.credits  ?? tx.credits  ?? tx.amount ?? 0),
      total:       Number(tx.total     ?? tx.amount    ?? pkg.price ?? 0),
      discount:    Number(tx.discount  ?? 0),
      status, statusLabel, payer,
    };
  };

  const sortedHistory = [...(history || [])].map(normalise).sort((a, b) => (a.date && b.date ? new Date(b.date) - new Date(a.date) : 0));

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setVoucherCode(''); setVoucherResult(null); setVoucherError(''); setCheckoutError('');
    setShowCheckoutModal(true);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true); setVoucherError(''); setVoucherResult(null);
    const result = await applyVoucher(voucherCode.trim());
    setVoucherLoading(false);
    if (result.success) { setVoucherResult(result.data); }
    else { setVoucherError(result.error || 'Invalid voucher code'); }
  };

  const effectivePrice = voucherResult?.finalPrice ?? selectedPackage?.price;

  const handleCheckout = async () => {
    if (!selectedPackage) return;
    setCheckoutLoading(true); setCheckoutError('');
    const result = await initiateCheckout({
      packageId:      selectedPackage.packageId,
      price:          effectivePrice,
      title:          selectedPackage.label || selectedPackage.title || selectedPackage.packageId,
      credits:        selectedPackage.amount || selectedPackage.credits || 0,
      currency:       selectedPackage.currency || 'USD',
      currencySymbol: selectedPackage.currencySymbol || '$',
      voucherID:      voucherResult?.voucherID || voucherResult?.id,
      discount:       voucherResult?.discount || 0,
    });
    setCheckoutLoading(false);
    if (!result.success) { setCheckoutError(result.error || 'Failed to start checkout. Please try again.'); }
  };

  /* ── Progress bar for balance ── */
  const usedPct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <DashboardLayout title="Credits">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credits</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your email sending credits</p>
        </div>
        <button
          onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors">
          <ShoppingCart className="w-4 h-4" />Buy Credits
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Available — gradient hero */}
        <div className="lg:col-span-1 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-primary-100">Available Credits</p>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold mb-1">{isLoading ? '…' : balance.toLocaleString()}</p>
          <p className="text-xs text-primary-200 mt-3">Ready to send</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Credits Used</p>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-2">{isLoading ? '…' : used.toLocaleString()}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-amber-400 rounded-full h-1.5 transition-all" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{usedPct}% of total</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Total Purchased</p>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? '…' : total.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">All time</p>
        </div>
      </div>

      {/* Credit Packages */}
      <div id="packages-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Credit Packages</h2>
          <p className="text-sm text-slate-500 mt-0.5">Choose the package that fits your needs</p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPackages.map((pkg) => (
              <div key={pkg.packageId || pkg.amount}
                className={`relative rounded-2xl border-2 p-6 text-center transition-all hover:shadow-md cursor-pointer group
                  ${pkg.popular ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 bg-white'}`}
                onClick={() => handleSelectPackage(pkg)}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                    <Sparkles className="w-3 h-3" />Popular
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center
                  ${pkg.popular ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{pkg.label}</h3>
                <p className="text-xs text-slate-500 mb-3">{(pkg.amount || pkg.credits || 0).toLocaleString()} credits</p>
                <p className="text-3xl font-bold text-slate-900 mb-4">
                  {pkg.currencySymbol || '$'}{pkg.price}
                </p>
                <button
                  className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors
                    ${pkg.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'border border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-700 hover:text-primary-700'}`}>
                  Purchase <ChevronRight className="inline w-3.5 h-3.5 -mt-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary-500" />Transaction History
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Latest credit purchases — newest first</p>
          </div>
          <button onClick={refreshTransactions} disabled={txLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${txLoading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>

        {txLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
            <p className="text-slate-400 text-xs mt-1">Your purchases will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Date','Package','Status','Total Paid','Credits'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedHistory.map((tx) => {
                  const sc = STATUS_STYLE[tx.status] || 'bg-slate-100 text-slate-600 border-slate-200';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {tx.date
                          ? new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                        {tx.date && (
                          <div className="text-xs text-slate-400">
                            {new Date(tx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-slate-900">{tx.title}</p>
                        {tx.payer && <p className="text-xs text-slate-400">{tx.payer}</p>}
                        {tx.discount > 0 && <p className="text-xs text-emerald-600">Discount: ${tx.discount}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc}`}>
                          {tx.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-right text-slate-900">
                        {tx.total > 0 ? `$${Number(tx.total).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-right text-emerald-600">
                        {tx.credits > 0 ? `+${Number(tx.credits).toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedPackage && (
        <Modal
          isOpen={showCheckoutModal}
          onClose={() => !checkoutLoading && setShowCheckoutModal(false)}
          title="Confirm Purchase"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCheckoutModal(false)} disabled={checkoutLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleCheckout} disabled={checkoutLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white transition-colors">
                {checkoutLoading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Redirecting to Stripe…</>
                  : <><CreditCard className="w-4 h-4" />Pay ${effectivePrice} with Stripe</>}
              </button>
            </div>
          }
        >
          <div className="py-2 space-y-4">
            {/* Package summary */}
            <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedPackage.label} Package</p>
                  <p className="text-sm text-slate-500">{(selectedPackage.amount || selectedPackage.credits || 0).toLocaleString()} credits</p>
                </div>
              </div>
              <div className="text-right">
                {voucherResult?.discount && (
                  <p className="text-xs text-slate-400 line-through">${selectedPackage.price}</p>
                )}
                <p className="text-2xl font-bold text-primary-600">${effectivePrice}</p>
              </div>
            </div>

            {/* Voucher input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Tag className="inline w-4 h-4 mr-1 text-slate-400" />
                Voucher / Coupon Code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={voucherCode}
                  onChange={(e) => { setVoucherCode(e.target.value); setVoucherResult(null); setVoucherError(''); }}
                  placeholder="Enter code"
                  disabled={voucherLoading || checkoutLoading}
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50"
                />
                <button onClick={handleApplyVoucher}
                  disabled={!voucherCode.trim() || voucherLoading || checkoutLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition-colors text-slate-700">
                  {voucherLoading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : 'Apply'}
                </button>
              </div>
              {voucherError && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{voucherError}</p>}
              {voucherResult && (
                <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Voucher applied! You save ${voucherResult.discount ?? (selectedPackage.price - voucherResult.finalPrice)}
                </p>
              )}
            </div>

            {checkoutError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{checkoutError}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              You will be redirected to Stripe's secure checkout page to complete payment.
            </p>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Credits;
