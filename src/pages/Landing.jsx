import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import { Mail, CreditCard, FileText, Users, BarChart3, Zap, Plane } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const features = [
    {
      icon: Mail,
      title: 'Email Campaigns',
      description: 'Create and send targeted email campaigns to your audience with ease.',
      color: 'bg-primary-500',
    },
    {
      icon: CreditCard,
      title: 'Credit-Based System',
      description: 'Pay only for what you use with our flexible credit-based pricing model.',
      color: 'bg-green-500',
    },
    {
      icon: FileText,
      title: 'Email Templates',
      description: 'Build beautiful email templates with our drag-and-drop editor.',
      color: 'bg-purple-500',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Import and manage your contacts easily from CSV or Excel files.',
      color: 'bg-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track campaign performance with detailed analytics and insights.',
      color: 'bg-pink-500',
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Enterprise-grade infrastructure ensures your emails are delivered on time.',
      color: 'bg-yellow-500',
    },
  ];
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary-50">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <img src="/mail-pilot-logo.png" alt="Mail Pilot Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold text-slate-900">Mail Pilot</span>
        </div>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </nav>
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Email Marketing<br />Made Simple
        </h1>
        <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
          Mail Pilot is a powerful CRM platform that helps you create, manage, and send 
          email campaigns with ease. Pay only for what you use.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button size="lg" onClick={() => navigate('/register')}>
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
        
        {/* Hero Image/Illustration */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-slate-200">
          <div className="aspect-video bg-linear-to-br from-primary-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="flex gap-6">
              <BarChart3 className="w-20 h-20 text-primary-600" />
              <Mail className="w-20 h-20 text-indigo-600" />
              <Users className="w-20 h-20 text-purple-600" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-700">
            Powerful features to help you succeed with email marketing
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-slate-200"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-700">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-primary-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses using Mail Pilot to grow their audience
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/register')}
          >
            Create Your Account
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2026 Mail Pilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
