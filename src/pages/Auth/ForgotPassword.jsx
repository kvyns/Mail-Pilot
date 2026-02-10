import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { isValidEmail } from '../../utils/validators';
import { Mail, Lock, CheckCircle, ArrowRight, ArrowLeft, Plane } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Code, 3: New Password, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Step 1: Enter Email and Send Code
  const handleSendCode = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrors({ email: 'Invalid email address' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authAPI.resendCode(formData.email);
      if (result.success) {
        setCurrentStep(2);
      }
    } catch (error) {
      setErrors({ email: error.message || 'Failed to send verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Validate Code
  const handleValidateCode = async () => {
    if (!formData.code) {
      setErrors({ code: 'Verification code is required' });
      return;
    }
    if (formData.code.length !== 6) {
      setErrors({ code: 'Code must be 6 digits' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authAPI.verifyEmail({
        email: formData.email,
        verificationCode: formData.code,
      });
      
      if (result.success) {
        setCurrentStep(3);
      }
    } catch (error) {
      setErrors({ code: error.message || 'Invalid verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleSetNewPassword = async () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authAPI.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword,
      });
      
      if (result.success) {
        setCurrentStep(4);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrors({ newPassword: error.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await authAPI.resendCode(formData.email);
      setErrors({ code: '' });
    } catch (error) {
      setErrors({ code: error.message || 'Failed to resend code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Enter Email
  const renderStepEmail = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
        <p className="text-slate-600">
          Enter your email and we'll send you a verification code
        </p>
      </div>

      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="john@example.com"
        autoFocus
      />

      <Button 
        fullWidth 
        onClick={handleSendCode}
        loading={isLoading}
        icon={<ArrowRight className="w-4 h-4" />}
      >
        Send Verification Code
      </Button>

      <div className="text-center">
        <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Back to Login
        </Link>
      </div>
    </div>
  );

  // Step 2: Enter Verification Code
  const renderStepCode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-teal-600" />
          <CheckCircle className="w-6 h-6 text-teal-600 absolute mb-8 ml-12 bg-white rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
        <p className="text-slate-600">
          We sent a verification code to<br />
          <span className="font-semibold text-slate-900">{formData.email}</span>
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <strong>For demo:</strong> Use any 6-digit code (e.g., 123456)
        </p>
      </div>

      <Input
        label="Verification Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        error={errors.code}
        placeholder="Enter 6-digit code"
        maxLength={6}
        className="text-center text-2xl tracking-widest"
        autoFocus
      />

      <div className="text-center">
        <button 
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
        >
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
          onClick={handleValidateCode}
          loading={isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Verify Code
        </Button>
      </div>
    </div>
  );

  // Step 3: Set New Password
  const renderStepPassword = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h2>
        <p className="text-slate-600">
          Choose a strong password for your account
        </p>
      </div>

      <Input
        label="New Password"
        type="password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
        placeholder="Min. 8 characters"
        autoFocus
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

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button 
          fullWidth 
          onClick={handleSetNewPassword}
          loading={isLoading}
          icon={<CheckCircle className="w-4 h-4" />}
        >
          Reset Password
        </Button>
      </div>
    </div>
  );

  // Step 4: Success
  const renderStepSuccess = () => (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">Password Reset!</h2>
      <p className="text-slate-600 mb-6">
        Your password has been successfully reset.<br />
        Redirecting to login...
      </p>
      <div className="flex items-center justify-center space-x-2 text-primary-600">
        <Lock className="w-5 h-5 animate-pulse" />
        <span className="font-medium">Securing your account...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/mail-pilot-logo.png" alt="Mail Pilot Logo" className="w-12 h-12" />
            <span className="text-3xl font-bold text-slate-900">Mail Pilot</span>
          </Link>
        </div>
        
        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {currentStep === 1 && renderStepEmail()}
          {currentStep === 2 && renderStepCode()}
          {currentStep === 3 && renderStepPassword()}
          {currentStep === 4 && renderStepSuccess()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
