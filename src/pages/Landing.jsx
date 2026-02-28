import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Mail, BarChart3, Users, FileText, Zap, Shield, CheckCircle,
  Star, ArrowRight, Send, TrendingUp, Globe, Lock, ChevronRight,
  Inbox, MousePointerClick, Clock, Award, Twitter, Linkedin,
  Facebook, Instagram, Menu, X, Target, Layers, RefreshCw,
} from 'lucide-react';

/* ─── data ───────────────────────────────────────────────────────────────── */
const NAV_LINKS = ['Features', 'How It Works', 'Testimonials', 'Pricing'];

const STATS = [
  { value: '2.4B+', label: 'Emails Delivered', icon: Send, color: 'text-primary-600' },
  { value: '98.7%', label: 'Deliverability Rate', icon: TrendingUp, color: 'text-green-600' },
  { value: '50K+', label: 'Active Businesses', icon: Globe, color: 'text-blue-600' },
  { value: '4.9★', label: 'Average Rating', icon: Award, color: 'text-amber-500' },
];

const FEATURES = [
  {
    icon: Mail, title: 'Smart Email Campaigns',
    description: 'Build, schedule, and send hyper-targeted campaigns. A/B test subject lines, automate follow-ups, and reach inboxes — not spam folders.',
    bullets: ['Drag-and-drop campaign builder', 'A/B subject line testing', 'Send-time optimisation'],
    color: 'bg-primary-50', iconColor: 'text-primary-600', border: 'border-primary-200',
  },
  {
    icon: BarChart3, title: 'Real-Time Analytics',
    description: 'Go beyond open rates. Track click maps, revenue per campaign, unsubscribe trends, and cohort performance in one unified dashboard.',
    bullets: ['Live open & click tracking', 'Revenue attribution', 'Custom report exports'],
    color: 'bg-blue-50', iconColor: 'text-blue-600', border: 'border-blue-200',
  },
  {
    icon: Users, title: 'Contact Management',
    description: 'Import, segment, and enrich your contacts. Build dynamic lists based on behavior, tags, and custom attributes.',
    bullets: ['CSV / Excel bulk import', 'Smart segmentation', 'Auto-clean bounced contacts'],
    color: 'bg-purple-50', iconColor: 'text-purple-600', border: 'border-purple-200',
  },
  {
    icon: Layers, title: 'Template Library',
    description: 'Start from 200+ professionally designed templates or build from scratch with the pixel-perfect visual editor.',
    bullets: ['200+ responsive templates', 'Visual drag-and-drop editor', 'Custom HTML support'],
    color: 'bg-orange-50', iconColor: 'text-orange-600', border: 'border-orange-200',
  },
  {
    icon: Shield, title: 'Compliance & Security',
    description: 'Stay compliant with GDPR, CAN-SPAM, and CASL automatically. SOC 2 Type II certified infrastructure.',
    bullets: ['Auto unsubscribe management', 'GDPR / CAN-SPAM built-in', 'SOC 2 Type II certified'],
    color: 'bg-green-50', iconColor: 'text-green-600', border: 'border-green-200',
  },
  {
    icon: Target, title: 'Multi-Brand Accounts',
    description: 'Manage multiple organisations under one login. Assign granular role-based permissions to every team member.',
    bullets: ['Unlimited sub-accounts', 'Role-based access control', 'Team activity audit log'],
    color: 'bg-rose-50', iconColor: 'text-rose-600', border: 'border-rose-200',
  },
];

const STEPS = [
  { number: '01', title: 'Import Your Contacts', icon: Users,
    description: 'Upload a CSV or Excel file, or connect your existing CRM. Mail Pilot cleans duplicates and validates emails automatically.' },
  { number: '02', title: 'Design Your Campaign', icon: FileText,
    description: 'Choose a template or build from scratch. Write compelling copy, add images, and personalise with dynamic fields.' },
  { number: '03', title: 'Send & Watch Results', icon: BarChart3,
    description: 'Schedule or send immediately. Track opens, clicks, and conversions in real time as they happen.' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell', role: 'Head of Marketing', company: 'NovaTech Solutions',
    avatar: 'SM', avatarBg: 'bg-primary-100', avatarText: 'text-primary-700', rating: 5,
    text: 'We switched from Mailchimp 6 months ago and our deliverability jumped from 91% to 98.4%. The campaign analytics are miles ahead — we can actually see which emails drive revenue.',
  },
  {
    name: 'James Okafor', role: 'CEO', company: 'Meridian Retail Group',
    avatar: 'JO', avatarBg: 'bg-blue-100', avatarText: 'text-blue-700', rating: 5,
    text: 'Managing 4 brands from one dashboard used to be a nightmare. Mail Pilot\'s multi-account system with role-based permissions is exactly what a growing business needs. Absolutely flawless.',
  },
  {
    name: 'Priya Sharma', role: 'Digital Strategist', company: 'Bloom Agency',
    avatar: 'PS', avatarBg: 'bg-purple-100', avatarText: 'text-purple-700', rating: 5,
    text: 'The credit-based model was a game-changer for our agency. We only pay for what we send — seasonal clients don\'t burn our budget in slow months. ROI-positive from day one.',
  },
];

const PLANS = [
  { credits: '1,000', price: '$10', tag: null, desc: 'Perfect for small newsletters and solopreneurs.' },
  { credits: '5,000', price: '$45', tag: 'Most Popular', desc: 'Ideal for growing teams running regular campaigns.' },
  { credits: '10,000', price: '$80', tag: null, desc: 'Serious senders who need consistent throughput.' },
  { credits: '50,000', price: '$350', tag: 'Best Value', desc: 'High-volume enterprises and marketing agencies.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-9 h-9" />
            <span className="text-xl font-bold text-slate-900">Mail Pilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))}
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                {l}
              </button>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors px-4 py-2">
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              Get Started Free
            </button>
          </div>
          <button className="md:hidden p-2 text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))}
                className="block w-full text-left text-sm font-medium text-slate-700 py-2">{l}</button>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate('/login')} className="flex-1 text-sm font-medium border border-slate-300 text-slate-700 py-2.5 rounded-lg">Sign In</button>
              <button onClick={() => navigate('/register')} className="flex-1 text-sm font-semibold bg-primary-600 text-white py-2.5 rounded-lg">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-0 bg-linear-to-br from-slate-900 via-slate-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-150 h-150 bg-primary-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-100 h-100 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-6 pt-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3 h-3" /> Trusted by 50,000+ Businesses Worldwide
            </span>
          </div>
          <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Email Marketing That<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-teal-300">
              Drives Real Revenue
            </span>
          </h1>
          <p className="text-center text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mail Pilot is the CRM built for performance marketers — intelligent campaigns,
            real-time analytics, contact management, and team collaboration in one elegant platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-7 py-4 bg-primary-500 hover:bg-primary-400 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5">
              Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => scrollTo('how-it-works')}
              className="flex items-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-xl border border-white/20 transition-all">
              See How It Works
            </button>
          </div>
          {/* Mock Dashboard */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-t-2xl p-1">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 bg-white/10 rounded px-3 py-1 text-xs text-slate-400">app.mailpilot.io/dashboard</div>
              </div>
              <div className="p-4 grid grid-cols-12 gap-3">
                <div className="col-span-2 space-y-1.5">
                  {['Overview','Campaigns','Templates','Contacts','Credits','Team'].map((item, i) => (
                    <div key={item} className={`text-xs px-2 py-1.5 rounded ${i === 0 ? 'bg-primary-500/30 text-primary-300 font-semibold' : 'text-slate-500'}`}>{item}</div>
                  ))}
                </div>
                <div className="col-span-10 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[['24,850','Emails Sent','↑ 12%'],['68.4%','Open Rate','↑ 3.1%'],['9.2%','Click Rate','↑ 0.8%'],['$4,280','Revenue','↑ 22%']].map(([v,l,d]) => (
                      <div key={l} className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                        <p className="text-white font-bold text-base">{v}</p>
                        <p className="text-slate-400 text-xs">{l}</p>
                        <p className="text-green-400 text-xs font-medium">{d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 h-24 flex items-end gap-1">
                    {[40,55,45,70,60,80,65,90,75,95,85,100].map((h,i) => (
                      <div key={i} className="flex-1 bg-primary-500/60 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 text-xs text-slate-400 px-3 py-1.5 border-b border-white/5">
                      <span>Campaign</span><span>Sent</span><span>Open Rate</span><span>Status</span>
                    </div>
                    {[['Q1 Newsletter','12,400','71.2%','Sent'],['Flash Sale','8,200','64.8%','Sent'],['Welcome Series','3,250','82.1%','Active']].map(([n,s,o,st]) => (
                      <div key={n} className="grid grid-cols-4 text-xs text-slate-300 px-3 py-1.5 border-b border-white/5 last:border-0">
                        <span className="truncate">{n}</span><span>{s}</span>
                        <span className="text-primary-300">{o}</span>
                        <span className={st === 'Active' ? 'text-green-400' : 'text-slate-400'}>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="space-y-2">
                <Icon className={`w-7 h-7 mx-auto ${color}`} />
                <p className="text-4xl font-extrabold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Platform Features</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900">Everything in One Place</h2>
            <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">
              From first email to full automation — Mail Pilot gives your team the tools to scale.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, bullets, color, iconColor, border }) => (
              <div key={title} className={`bg-white rounded-2xl border ${border} p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}>
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{description}</p>
                <ul className="space-y-1.5">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900">Up & Running in Minutes</h2>
            <p className="mt-4 text-xl text-slate-500 max-w-xl mx-auto">No complex setup, no developer needed. Three steps to your first campaign.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map(({ number, title, description, icon: Icon }) => (
              <div key={number} className="relative text-center">
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-200">
                    <Icon className="w-9 h-9 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    {number.replace('0', '')}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS HIGHLIGHT ───────────────────────────────────────────── */}
      <section className="py-20 bg-linear-to-br from-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-300 font-semibold text-sm uppercase tracking-widest">Proven Results</span>
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">Numbers That<br />Speak for Themselves</h2>
              <p className="mt-4 text-primary-100 text-lg">Our customers see measurable improvements within weeks. Mail Pilot is engineered for deliverability, performance, and growth.</p>
              <button onClick={() => navigate('/register')}
                className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
                See Your Results <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: '+34%', desc: 'Avg. lift in open rates vs previous platform', icon: Inbox },
                { metric: '3.2×', desc: 'More revenue per campaign with smart segmentation', icon: TrendingUp },
                { metric: '-61%', desc: 'Reduction in bounce rate after first list clean', icon: RefreshCw },
                { metric: '< 2min', desc: 'Average campaign setup time, start to schedule', icon: Clock },
              ].map(({ metric, desc, icon: Icon }) => (
                <div key={metric} className="bg-white/10 border border-white/15 rounded-2xl p-5">
                  <Icon className="w-6 h-6 text-primary-300 mb-3" />
                  <p className="text-3xl font-extrabold text-white">{metric}</p>
                  <p className="text-primary-200 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Customer Stories</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900">Loved by Marketers</h2>
            <p className="mt-4 text-xl text-slate-500 max-w-xl mx-auto">Real businesses, real results. Here's what our customers have to say.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, company, avatar, avatarBg, avatarText, rating, text }) => (
              <div key={name} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center ${avatarText} font-bold text-sm shrink-0`}>{avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{role} · {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
            {[
              { label: 'G2 Reviews', rating: '4.9/5', count: '(1,240 reviews)' },
              { label: 'Capterra', rating: '4.8/5', count: '(890 reviews)' },
              { label: 'Product Hunt', rating: '#1 Product', count: 'of the Day' },
            ].map(({ label, rating: r, count }) => (
              <div key={label} className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-700">{label}</span>
                <span className="font-bold text-slate-900">{r}</span>
                <span className="text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Pricing</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900">Pay Only for What You Send</h2>
            <p className="mt-4 text-xl text-slate-500 max-w-xl mx-auto">No subscriptions, no wastage. Buy credits when you need them. They never expire.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map(({ credits, price, tag, desc }) => (
              <div key={credits} className={`relative rounded-2xl border p-6 flex flex-col transition-all ${tag === 'Most Popular' ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-300'}`}>
                {tag && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${tag === 'Most Popular' ? 'bg-primary-600 text-white' : 'bg-amber-500 text-white'}`}>{tag}</span>
                )}
                <p className="text-2xl font-extrabold text-slate-900 mt-2">{price}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                <p className="text-primary-600 font-semibold text-sm mt-1">{credits} credits</p>
                <p className="text-slate-500 text-xs mt-2 mb-5 flex-1">{desc}</p>
                <button onClick={() => navigate('/register')}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${tag === 'Most Popular' ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-slate-900 hover:bg-slate-700 text-white'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">
            Need a custom volume plan?{' '}
            <span className="text-primary-600 font-medium cursor-pointer hover:underline">Talk to sales →</span>
          </p>
        </div>
      </section>

      {/* ── TRUST BADGES ────────────────────────────────────────────────── */}
      <section className="py-14 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Security & Compliance</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              [Lock, 'SOC 2 Type II'], [Shield, 'GDPR Compliant'], [Globe, 'CAN-SPAM Act'],
              [CheckCircle, 'CASL Certified'], [Award, 'ISO 27001'], [MousePointerClick, '99.9% Uptime SLA'],
            ].map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-2 text-slate-500">
                <Icon className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4">
            <Zap className="w-4 h-4" /> Ready to launch?
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Start Sending Smarter<br /><span className="text-primary-400">Emails Today</span>
          </h2>
          <p className="text-slate-300 text-xl max-w-xl mx-auto mb-10">
            Join 50,000+ businesses driving revenue with Mail Pilot. No credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-0.5">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-xl border border-white/20 transition-all">
              Sign In
            </button>
          </div>
          <p className="mt-6 text-slate-500 text-sm">Free to start · Credits never expire · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/mail-pilot-logo.png" alt="Mail Pilot" className="w-8 h-8" />
                <span className="text-lg font-bold text-white">Mail Pilot</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">The CRM platform built for modern email marketers. Drive revenue, not just opens.</p>
              <div className="flex gap-3">
                {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-primary-700 flex items-center justify-center cursor-pointer transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { heading: 'Support', links: ['Documentation', 'API Reference', 'Status', 'Contact'] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-white font-semibold text-sm mb-4">{heading}</p>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l}><span className="text-sm hover:text-primary-400 cursor-pointer transition-colors">{l}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© 2026 Mail Pilot. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <span key={l} className="hover:text-slate-300 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
