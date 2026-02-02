import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { isValidEmail, validatePassword } from '../../utils/validators';
import { 
  ClipboardCheck, 
  Mail, 
  CheckCircle, 
  Briefcase, 
  Laptop,
  ArrowRight,
  ArrowLeft,
  Plane
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Sign Up
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    // Step 2: Verification
    verificationCode: '',
    // Step 3: Business Details
    businessName: '',
    businessType: '',
    companySize: '',
    industry: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }
    
    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = async () => {
    if (!validateStep1()) return;
    
    setIsLoading(true);
    try {
      const result = await authAPI.register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });
      
      if (result.success) {
        setCurrentStep(2);
      }
    } catch (error) {
      setErrors({ email: error.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Next = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      const result = await authAPI.verifyEmail({
        email: formData.email,
        verificationCode: formData.verificationCode,
      });
      
      if (result.success) {
        setCurrentStep(3);
      }
    } catch (error) {
      setErrors({ verificationCode: error.message || 'Verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!validateStep3()) return;
    
    setIsLoading(true);
    try {
      const result = await authAPI.addBusinessDetails({
        email: formData.email,
        businessName: formData.businessName,
        businessType: formData.businessType,
        companySize: formData.companySize,
        industry: formData.industry,
      });
      
      if (result.success) {
        // Store token and user data
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        
        setCurrentStep(4);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setErrors({ businessName: error.message || 'Failed to complete registration' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Sign Up', icon: <ClipboardCheck className="w-5 h-5" /> },
      { number: 2, label: 'Verify Email', icon: <Mail className="w-5 h-5" /> },
      { number: 3, label: 'Business Details', icon: <Briefcase className="w-5 h-5" /> },
      { number: 4, label: 'Completed!', icon: <CheckCircle className="w-5 h-5" /> },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 relative top-[-20px]">
                  <div className={`h-full rounded transition-all ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h2>
        <p className="text-slate-600">Enter your details to get started</p>
      </div>

      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="John Doe"
      />

      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="john@example.com"
      />

      <Input
        label="Mobile Number"
        type="tel"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        error={errors.mobile}
        placeholder="+1 234 567 8900"
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Min. 8 characters"
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Re-enter password"
      />

      <Button 
        fullWidth 
        onClick={handleStep1Next}
        icon={<ArrowRight className="w-4 h-4" />}
      >
        Continue to Verification
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
        <p className="text-slate-600">
          We've sent a verification code to<br />
          <span className="font-semibold text-slate-900">{formData.email}</span>
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>For demo purposes:</strong> Use any 6-digit code (e.g., 123456)
        </p>
      </div>

      <Input
        label="Verification Code"
        name="verificationCode"
        value={formData.verificationCode}
        onChange={handleChange}
        error={errors.verificationCode}
        placeholder="Enter 6-digit code"
        maxLength={6}
        className="text-center text-2xl tracking-widest"
      />

      <div className="text-center">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Resend verification code
        </button>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button 
          fullWidth 
          onClick={handleStep2Next}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Verify & Continue
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Business Details</h2>
        <p className="text-slate-600">Tell us about your business</p>
      </div>

      <Input
        label="Business Name"
        name="businessName"
        value={formData.businessName}
        onChange={handleChange}
        error={errors.businessName}
        placeholder="Acme Corporation"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.businessType ? 'border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="">Select business type</option>
          <option value="individual">Individual/Freelancer</option>
          <option value="startup">Startup</option>
          <option value="smb">Small/Medium Business</option>
          <option value="enterprise">Enterprise</option>
          <option value="agency">Agency</option>
        </select>
        {errors.businessType && <p className="text-sm text-red-600 mt-1">{errors.businessType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Company Size</label>
        <select
          name="companySize"
          value={formData.companySize}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.companySize ? 'border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="">Select company size</option>
          <option value="1">Just me</option>
          <option value="2-10">2-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="500+">500+ employees</option>
        </select>
        {errors.companySize && <p className="text-sm text-red-600 mt-1">{errors.companySize}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
        <select
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.industry ? 'border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="">Select industry</option>
          <option value="technology">Technology</option>
          <option value="ecommerce">E-commerce</option>
          <option value="healthcare">Healthcare</option>
          <option value="education">Education</option>
          <option value="finance">Finance</option>
          <option value="marketing">Marketing</option>
          <option value="realestate">Real Estate</option>
          <option value="other">Other</option>
        </select>
        {errors.industry && <p className="text-sm text-red-600 mt-1">{errors.industry}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button 
          fullWidth 
          onClick={handleStep3Submit}
          loading={isLoading}
          icon={<CheckCircle className="w-4 h-4" />}
        >
          Complete Registration
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to Mail Pilot!</h2>
      <p className="text-slate-600 mb-6">
        Your account has been successfully created.<br />
        Redirecting to your dashboard...
      </p>
      <div className="flex items-center justify-center space-x-2 text-blue-600">
        <Laptop className="w-5 h-5 animate-pulse" />
        <span className="font-medium">Setting up your workspace...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Plane className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-slate-900">Mail Pilot</span>
          </Link>
        </div>
        
        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          
          {currentStep < 4 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
