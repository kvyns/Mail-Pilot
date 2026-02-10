import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usersAPI } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validatePassword } from '../../utils/validators';
import { 
  Mail, 
  Lock,
  CheckCircle, 
  User,
  Plane,
  Shield,
  Eye
} from 'lucide-react';

const ActivateAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    verificationCode: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [invitationDetails, setInvitationDetails] = useState(null);

  useEffect(() => {
    // In production, verify the token and get invitation details
    if (formData.token) {
      setInvitationDetails({
        email: formData.email,
        role: 'account-admin', // This would come from the backend
        businessName: 'TechCorp Solutions',
      });
    }
  }, [formData.token, formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

  const handleVerifyCode = async () => {
    if (!validateStep1()) return;
    
    setIsLoading(true);
    try {
      // In production, verify the code with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(2);
    } catch (error) {
      setErrors({ verificationCode: error.message || 'Invalid verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      const response = await usersAPI.activate({
        email: formData.email,
        token: formData.token,
        verificationCode: formData.verificationCode,
        name: formData.name,
        password: formData.password,
        role: invitationDetails?.role,
      });
      
      // Store auth token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      setCurrentStep(3);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Activation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super-admin':
        return { icon: Shield, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'account-admin':
        return { icon: Shield, color: 'text-primary-600', bgColor: 'bg-primary-100' };
      case 'read-only':
        return { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100' };
      default:
        return { icon: User, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'account-admin': return 'Account Admin';
      case 'read-only': return 'Read Only';
      default: return 'User';
    }
  };

  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          Enter the 6-digit verification code sent to <span className="font-semibold">{formData.email}</span>
        </p>
      </div>

      {/* Invitation Info */}
      {invitationDetails && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800 mb-2">
            <span className="font-semibold">You've been invited to:</span>
          </p>
          <p className="font-semibold text-primary-900">{invitationDetails.businessName}</p>
          <p className="text-sm text-primary-700">
            Role: {getRoleName(invitationDetails.role)}
          </p>
        </div>
      )}

      {errors.verificationCode && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.verificationCode}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Verification Code"
          type="text"
          name="verificationCode"
          value={formData.verificationCode}
          onChange={handleChange}
          placeholder="000000"
          maxLength={6}
          error={errors.verificationCode}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        <Button
          onClick={handleVerifyCode}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          Verify & Continue
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Registration</h2>
        <p className="text-gray-600">
          Create your account details to get started
        </p>
      </div>

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.name}
          icon={<User className="w-5 h-5" />}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.confirmPassword}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold mb-1">Password Requirements:</p>
          <ul className="space-y-1 ml-4">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
          </ul>
        </div>

        <Button
          onClick={handleActivateAccount}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          Activate Account
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const roleInfo = getRoleIcon(invitationDetails?.role);
    const RoleIcon = roleInfo.icon;

    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Account Activated!</h2>
        <p className="text-gray-600 mb-4">
          Your account has been successfully activated.
        </p>
        <div className={`inline-flex items-center space-x-2 px-4 py-2 ${roleInfo.bgColor} ${roleInfo.color} rounded-lg font-semibold mb-6`}>
          <RoleIcon className="w-5 h-5" />
          <span>{getRoleName(invitationDetails?.role)} Access Granted</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-primary-600">
          <Plane className="w-5 h-5 animate-pulse" />
          <span className="font-medium">Redirecting to dashboard...</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/mail-pilot-logo.png" alt="Mail Pilot Logo" className="w-12 h-12" />
            <span className="text-3xl font-bold text-gray-900">Mail Pilot</span>
          </Link>
        </div>
        
        {/* Activation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Step Indicator */}
          {currentStep < 3 && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
