import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { isValidEmail } from '../../utils/validators';
import { 
  Mail, 
  UserPlus, 
  CheckCircle, 
  ArrowLeft,
  Shield,
  User,
  Eye
} from 'lucide-react';

const InviteUser = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [invitationResult, setInvitationResult] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || token.split('.').length !== 3) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedAccount');
      navigate('/login', { state: { message: 'Please login to invite users' } });
    }
  }, [navigate]);

  const roles = [
    {
      id: 'super-admin',
      name: 'Super Admin',
      description: 'Full access to all features and settings',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'account-admin',
      name: 'Account Admin',
      description: 'Manage users, campaigns, and account settings',
      icon: User,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      id: 'read-only',
      name: 'Read Only',
      description: 'View-only access to campaigns and reports',
      icon: Eye,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectRole = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvitation = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await usersAPI.invite({
        email: formData.email,
        role: formData.role,
        roleID: formData.role,
      });
      
      setInvitationResult(response.data);
      setCurrentStep(2);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to send invitation' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite New User</h2>
        <p className="text-gray-600">
          Send an invitation to add a new user to your account
        </p>
      </div>

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          error={errors.email}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assign Role <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.role === role.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.role === role.id
                        ? role.bgColor + ' ' + role.color
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    {formData.role === role.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSendInvitation}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedRole = roles.find(r => r.id === formData.role);
    const IconComponent = selectedRole?.icon;

    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Invitation Sent!</h2>
        <p className="text-gray-600 mb-6">
          An activation email has been sent to<br />
          <span className="font-semibold text-gray-900">{formData.email}</span>
        </p>

        {/* Invitation Details */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6 text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${selectedRole?.bgColor} ${selectedRole?.color}`}>
              {IconComponent && <IconComponent className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm text-gray-600">Role Assigned</p>
              <p className="font-semibold text-gray-900">{selectedRole?.name}</p>
            </div>
          </div>
          <div className="text-sm text-primary-800">
            <p className="mb-2">
              <span className="font-semibold">📧 Next Steps:</span>
            </p>
            <ul className="space-y-1 ml-4">
              <li>• User will receive an activation email</li>
              <li>• They can click "Activate Account" to proceed</li>
              <li>• After verification, they can access the dashboard</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              setCurrentStep(1);
              setFormData({ email: '', role: '' });
              setInvitationResult(null);
            }}
            variant="outline"
            fullWidth
          >
            Invite Another User
          </Button>
          <Button
            onClick={() => navigate('/users')}
            fullWidth
          >
            Back to Users
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2">
            <img src="/mail-pilot-logo.png" alt="Mail Pilot Logo" className="w-12 h-12" />
            <span className="text-3xl font-bold text-gray-900">Mail Pilot</span>
          </div>
        </div>
        
        {/* Invitation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>
      </div>
    </div>
  );
};

export default InviteUser;
