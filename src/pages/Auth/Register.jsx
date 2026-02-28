import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../api';
import PhoneInput from '../../components/common/PhoneInput';
import { isValidEmail, validatePassword } from '../../utils/validators';
import {
  ClipboardCheck, Mail, CheckCircle, Briefcase, Laptop,
  ArrowRight, ArrowLeft, UserPlus, Eye, EyeOff, Lock,
  User, Phone, Globe, Twitter, Facebook, Instagram,
  Zap, Send, BarChart3, Users, Building2,
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState({ type: '', message: '' });
  const [isInvitedUser, setIsInvitedUser] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+44',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    inviteToken: '',
    verificationCode: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    website: '',
    x: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    tripadviser: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');
    if (emailFromUrl) {
      setIsInvitedUser(true);
      setFormData(prev => ({ ...prev, email: emailFromUrl, inviteToken: tokenFromUrl || '' }));
      setApiResponse({ type: 'success', message: 'Welcome! Complete your registration to activate your account.' });
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber' && typeof value === 'object') {
      setFormData(prev => ({ ...prev, countryCode: value.countryCode, mobileNumber: value.mobileNumber }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiResponse.message) setApiResponse({ type: '', message: '' });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.mobileNumber || formData.mobileNumber.trim() === '') newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{8,15}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number. Enter 8-15 digits';
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.message;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.verificationCode.trim()) newErrors.verificationCode = 'Verification code is required';
    else if (formData.verificationCode.length !== 6) newErrors.verificationCode = 'Verification code must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = async () => {
    if (!validateStep1()) return;
    setIsLoading(true);
    setApiResponse({ type: '', message: '' });
    try {
      const fullMobileNumber = `${formData.countryCode}${formData.mobileNumber}`;
      const result = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: fullMobileNumber,
        password: formData.password,
        ...(formData.inviteToken ? { inviteToken: formData.inviteToken } : {}),
      });
      if (result.responseCode === 1 || result.responseStatus === 'SUCCESS' || result.success) {
        setApiResponse({ type: 'success', message: result.responseMessage || result.message || 'Verification code sent to your email!' });
        setCurrentStep(2);
      } else {
        const failMsg = (result.responseMessage || result.error || '').toLowerCase();
        const alreadyExists = failMsg.includes('already') || failMsg.includes('exist') || failMsg.includes('duplicate') || failMsg.includes('registered');
        if (isInvitedUser && alreadyExists) {
          setAccountExists(true);
          setApiResponse({ type: 'error', message: result.responseMessage || 'An account with this email already exists.' });
        } else {
          setApiResponse({ type: 'error', message: result.responseMessage || result.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      const msg = (error.message || '').toLowerCase();
      const isAlreadyExists = msg.includes('already') || msg.includes('exist') || msg.includes('duplicate') || msg.includes('registered');
      if (isInvitedUser && isAlreadyExists) {
        setAccountExists(true);
        setApiResponse({ type: 'error', message: error.message || 'An account with this email already exists.' });
      } else {
        setApiResponse({ type: 'error', message: error.message || 'Registration failed. Please try again.' });
        setErrors({ email: error.message || 'Registration failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Next = async () => {
    if (!validateStep2()) return;
    setIsLoading(true);
    setApiResponse({ type: '', message: '' });
    try {
      const result = await authAPI.verifyEmail({ email: formData.email, code: formData.verificationCode });
      if (!result || result === '' || (typeof result === 'string' && result.trim() === '')) {
        setApiResponse({ type: 'success', message: 'Email verified successfully!' });
        setCurrentStep(3);
        return;
      }
      if (result.responseCode === 1 || result.responseStatus === 'SUCCESS' || result.success) {
        const verifyToken = result.token || result.data?.token;
        const verifyUser = result.user || result.data?.user;
        if (verifyToken) {
          localStorage.setItem('authToken', verifyToken);
          if (verifyUser) localStorage.setItem('user', JSON.stringify(verifyUser));
        }
        setApiResponse({ type: 'success', message: result.responseMessage || 'Email verified successfully!' });
        if (isInvitedUser) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login', { state: { email: formData.email, message: 'Account activated! Sign in to get started.' } });
          }, 1500);
        } else {
          setCurrentStep(3);
        }
      } else {
        setApiResponse({ type: 'error', message: result.responseMessage || result.error || 'Verification failed. Please check your code.' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: error.message || 'Verification failed. Please check your code.' });
      setErrors({ verificationCode: error.message || 'Verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!validateStep3()) return;
    setIsLoading(true);
    setApiResponse({ type: '', message: '' });
    try {
      const result = await authAPI.addBusinessDetails({
        email: formData.email,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        website: formData.website,
        x: formData.x,
        facebook: formData.facebook,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        tripadviser: formData.tripadviser,
      });
      if (result.responseCode === 1 || result.responseStatus === 'SUCCESS' || result.success) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedAccount');
        setApiResponse({ type: 'success', message: result.responseMessage || 'Registration completed! Please sign in to continue.' });
        setCurrentStep(4);
        setTimeout(() => {
          navigate('/login', { state: { email: formData.email, message: 'Registration complete! Sign in to get started.' } });
        }, 2500);
      } else {
        setApiResponse({ type: 'error', message: result.responseMessage || result.error || 'Failed to complete registration' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: error.message || 'Failed to save business details. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipStep3 = () => {
    localStorage.setItem('user', JSON.stringify({ email: formData.email, firstName: formData.firstName, lastName: formData.lastName }));
    setApiResponse({ type: 'success', message: 'Registration completed! You can add business details later from Settings.' });
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  /* ─── helpers ────────────────────────────────────────────────────────── */
  const Field = ({ label, icon: Icon, error, children, hint }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );

  const inputCls = (hasErr, hasIcon = true) =>
    `w-full ${hasIcon ? 'pl-10' : 'pl-3.5'} pr-4 py-3 rounded-xl border text-sm transition-colors outline-none ${
      hasErr
        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-slate-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
    }`;

  const PrimaryBtn = ({ onClick, loading, children, type = 'button', fullWidth = true }) => (
    <button type={type} onClick={onClick} disabled={loading}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0`}>
      {loading ? (
        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Processing...</>
      ) : children}
    </button>
  );

  const OutlineBtn = ({ onClick, children }) => (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-2 px-5 py-3.5 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-sm rounded-xl transition-colors shrink-0">
      {children}
    </button>
  );

  /* ─── left panel content per step ──────────────────────────────────── */
  const leftContent = [
    {
      step: 1,
      badge: 'Create Your Account',
      head: 'Start Sending\nSmarter Emails',
      sub: 'Join 50,000+ businesses. Set up in minutes — no credit card required.',
      bullets: [
        { icon: Send, text: '98.7% inbox deliverability rate' },
        { icon: BarChart3, text: 'Real-time analytics & click maps' },
        { icon: Users, text: 'Team collaboration built-in' },
      ],
    },
    {
      step: 2,
      badge: 'Verify Your Email',
      head: 'Check Your\nInbox',
      sub: "We've sent a 6-digit code to your email. It expires in 15 minutes.",
      bullets: [
        { icon: Mail, text: 'Check your spam folder if needed' },
        { icon: Lock, text: 'Secure one-time verification code' },
        { icon: Zap, text: 'Takes less than 30 seconds' },
      ],
    },
    {
      step: 3,
      badge: 'Business Details',
      head: 'Set Up Your\nOrganisation',
      sub: 'Tell us about your business so we can personalise your experience.',
      bullets: [
        { icon: Building2, text: 'Your own branded workspace' },
        { icon: Users, text: 'Invite unlimited team members' },
        { icon: Globe, text: 'Multi-org support built-in' },
      ],
    },
    {
      step: 4,
      badge: "You're All Set!",
      head: "Welcome to\nMail Pilot",
      sub: "Your account is ready. Redirecting you to the sign-in page now.",
      bullets: [
        { icon: CheckCircle, text: 'Account verified & activated' },
        { icon: Send, text: 'Ready to send your first campaign' },
        { icon: Zap, text: 'Workspace set up instantly' },
      ],
    },
  ];

  const lc = leftContent[(isInvitedUser ? 0 : currentStep - 1)] || leftContent[0];

  /* ─── step indicator ────────────────────────────────────────────────── */
  const renderStepIndicator = () => {
    if (isInvitedUser) return null;
    const steps = [
      { n: 1, label: 'Sign Up' },
      { n: 2, label: 'Verify' },
      { n: 3, label: 'Business' },
      { n: 4, label: 'Done' },
    ];
    return (
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > s.n ? 'bg-primary-600 text-white' :
                currentStep === s.n ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                'bg-slate-100 text-slate-400'
              }`}>
                {currentStep > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${currentStep >= s.n ? 'text-primary-600' : 'text-slate-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2">
                <div className={`h-full rounded-full transition-all ${currentStep > s.n ? 'bg-primary-600' : 'bg-slate-200'}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  /* ─── step 1 ─────────────────────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {isInvitedUser ? 'Complete Your Registration' : 'Create your account'}
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          {isInvitedUser ? "You've been invited — fill in your details to activate." : 'Enter your personal details to get started.'}
        </p>
      </div>

      {isInvitedUser && (
        <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <Mail className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary-900">Invitation received</p>
            <p className="text-xs text-primary-700 mt-0.5">Complete your registration to activate your account.</p>
          </div>
        </div>
      )}

      {isInvitedUser && accountExists && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
          <p className="text-sm font-semibold text-amber-900 mb-1">Account already exists</p>
          <p className="text-xs text-amber-800 mb-3">An account for <span className="font-medium">{formData.email}</span> already exists. Sign in to accept the invitation.</p>
          <button onClick={() => navigate('/login', { state: { email: formData.email, message: 'Sign in to accept your invitation.' } })}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors">
            Sign In to Accept Invitation <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" icon={User} error={errors.firstName}>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className={inputCls(!!errors.firstName)} />
        </Field>
        <Field label="Last Name" icon={User} error={errors.lastName}>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className={inputCls(!!errors.lastName)} />
        </Field>
      </div>

      <Field label="Email Address" icon={Mail} error={errors.email} hint={isInvitedUser ? 'Pre-filled from your invitation link' : ''}>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={isInvitedUser}
          className={`${inputCls(!!errors.email)} ${isInvitedUser ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
      </Field>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
        <PhoneInput label="" name="mobileNumber" value={`${formData.countryCode}${formData.mobileNumber}`} onChange={handleChange} error={errors.mobileNumber} required />
      </div>

      <Field label="Password" error={errors.password}>
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters"
          className={`${inputCls(!!errors.password)} pr-11`} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </Field>

      <Field label="Confirm Password" error={errors.confirmPassword}>
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
          className={`${inputCls(!!errors.confirmPassword)} pr-11`} />
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </Field>

      <PrimaryBtn onClick={handleStep1Next} loading={isLoading}>
        {isInvitedUser ? <><CheckCircle className="w-4 h-4" /> Activate Account</> : <>Continue to Verification <ArrowRight className="w-4 h-4" /></>}
      </PrimaryBtn>

      {isInvitedUser && !accountExists && (
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button type="button" className="text-primary-600 font-semibold hover:underline"
            onClick={() => navigate('/login', { state: { email: formData.email, message: 'Sign in to accept your invitation.' } })}>
            Sign in instead
          </button>
        </p>
      )}
    </div>
  );

  /* ─── step 2 ─────────────────────────────────────────────────────── */
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-5">
          <Mail className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Verify Your Email</h2>
        <p className="text-slate-500 text-sm mt-1">
          We sent a 6-digit code to <span className="font-semibold text-slate-900">{formData.email}</span>
        </p>
      </div>

      <Field label="Verification Code" error={errors.verificationCode}>
        <input
          name="verificationCode"
          value={formData.verificationCode}
          onChange={handleChange}
          placeholder="• • • • • •"
          maxLength={6}
          className={`w-full px-4 py-4 rounded-xl border text-center text-3xl font-bold tracking-[0.5em] transition-colors outline-none ${
            errors.verificationCode ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
          }`}
        />
      </Field>

      <div className="text-center">
        <button type="button" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
          Didn't receive it? Resend code
        </button>
      </div>

      <div className="flex gap-3">
        <OutlineBtn onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </OutlineBtn>
        <PrimaryBtn onClick={handleStep2Next} loading={isLoading}>
          Verify & Continue <ArrowRight className="w-4 h-4" />
        </PrimaryBtn>
      </div>
    </div>
  );

  /* ─── step 3 ─────────────────────────────────────────────────────── */
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7 text-primary-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Business Details</h2>
        <p className="text-slate-500 text-sm mt-1">Optional — you can complete this later in Settings.</p>
      </div>

      <Field label="Business Name *" icon={Building2} error={errors.businessName}>
        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Acme Corporation" className={inputCls(!!errors.businessName)} />
      </Field>

      <Field label="Business Email" icon={Mail} error={errors.businessEmail}>
        <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} placeholder="hello@acme.com" className={inputCls(!!errors.businessEmail)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Business Phone" icon={Phone} error={errors.businessPhone}>
          <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleChange} placeholder="+44 20 0000 0000" className={inputCls(!!errors.businessPhone)} />
        </Field>
        <Field label="Website" icon={Globe} error={errors.website}>
          <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://acme.com" className={inputCls(!!errors.website)} />
        </Field>
      </div>

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest pt-1">Social Media <span className="font-normal normal-case text-slate-400">(optional)</span></p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="X (Twitter)" icon={Twitter}>
          <input type="text" name="x" value={formData.x} onChange={handleChange} placeholder="@acmecorp" className={inputCls(false)} />
        </Field>
        <Field label="Facebook" icon={Facebook}>
          <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="facebook.com/acme" className={inputCls(false)} />
        </Field>
        <Field label="Instagram" icon={Instagram}>
          <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@acmecorp" className={inputCls(false)} />
        </Field>
        <Field label="TikTok">
          <input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="@acmecorp" className={inputCls(false, false)} />
        </Field>
      </div>

      <Field label="TripAdvisor" icon={Globe}>
        <input type="text" name="tripadviser" value={formData.tripadviser} onChange={handleChange} placeholder="tripadvisor.com/acme" className={inputCls(false)} />
      </Field>

      <div className="flex gap-3 pt-1">
        <OutlineBtn onClick={() => setCurrentStep(2)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </OutlineBtn>
        <PrimaryBtn onClick={handleStep3Submit} loading={isLoading}>
          Complete Registration <CheckCircle className="w-4 h-4" />
        </PrimaryBtn>
      </div>
      <button type="button" onClick={handleSkipStep3} disabled={isLoading}
        className="w-full py-3 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
        Skip for now — complete later in Settings
      </button>
    </div>
  );

  /* ─── step 4 ─────────────────────────────────────────────────────── */
  const renderStep4 = () => (
    <div className="text-center py-6 space-y-6">
      <div className="relative inline-flex">
        <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center">
          <CheckCircle className="w-14 h-14 text-green-600" />
        </div>
        <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </span>
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome to Mail Pilot!</h2>
        <p className="text-slate-500">Your account has been successfully created.</p>
      </div>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-100 text-primary-700 rounded-xl font-semibold text-sm">
        <Briefcase className="w-4 h-4" /> Super Admin Role Assigned
      </div>
      <div className="flex items-center justify-center gap-2 text-primary-600 text-sm font-medium">
        <Laptop className="w-4 h-4 animate-pulse" /> Setting up your workspace...
      </div>
    </div>
  );

  /* ─── main render ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-slate-900 via-slate-800 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <Link to="/" className="relative z-10 flex items-center gap-2.5 w-fit">
          <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-10 h-10" />
          <span className="text-white text-2xl font-bold">Mail Pilot</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 text-primary-400 text-xs font-semibold uppercase tracking-widest">
            <Zap className="w-3 h-3" /> {lc.badge}
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight whitespace-pre-line">{lc.head}</h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-xs">{lc.sub}</p>
          <ul className="space-y-3">
            {lc.bullets.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-slate-300 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['SK','MR','AJ'].map((initials, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white ${['bg-primary-500','bg-blue-500','bg-teal-500'][i]}`}>{initials}</div>
            ))}
          </div>
          <p className="text-slate-400 text-xs">Join <span className="text-white font-semibold">50,000+</span> businesses already using Mail Pilot</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto p-6 lg:p-10 bg-white">
        <div className="w-full max-w-lg py-8">

          {/* Mobile logo */}
          <div className="lg:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-8 h-8" />
              <span className="text-slate-900 text-lg font-bold">Mail Pilot</span>
            </Link>
          </div>

          {/* API Response */}
          {apiResponse.message && (
            <div className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${
              apiResponse.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              {apiResponse.type === 'success'
                ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                : <div className="w-5 h-5 text-red-600 shrink-0 mt-0.5"><svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></div>
              }
              <p className={`text-sm font-medium ${apiResponse.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{apiResponse.message}</p>
            </div>
          )}

          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {currentStep < 4 && (
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
