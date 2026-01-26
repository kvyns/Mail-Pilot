import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';

const Settings = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    phone: '',
  });
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    campaignReports: true,
    weeklyDigest: false,
  });
  
  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
  };
  
  const handleChangePassword = () => {
    if (password.new !== password.confirm) {
      alert('New passwords do not match');
      return;
    }
    alert('Password changed successfully!');
    setPassword({ current: '', new: '', confirm: '' });
  };
  
  const handleSavePreferences = () => {
    alert('Preferences saved successfully!');
  };
  
  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        {/* Profile Settings */}
        <Card title="Profile Information" subtitle="Update your personal details">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </Card>
        
        {/* Change Password */}
        <Card title="Change Password" subtitle="Update your password">
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
            />
            
            <div className="flex justify-end">
              <Button onClick={handleChangePassword}>Change Password</Button>
            </div>
          </div>
        </Card>
        
        {/* Notification Preferences */}
        <Card title="Notification Preferences" subtitle="Manage your email notifications">
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-slate-900">Email Notifications</div>
                <div className="text-sm text-slate-600">Receive notifications about account activity</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.campaignReports}
                onChange={(e) => setPreferences({ ...preferences, campaignReports: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-slate-900">Campaign Reports</div>
                <div className="text-sm text-slate-600">Get detailed reports after each campaign</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-slate-900">Weekly Digest</div>
                <div className="text-sm text-slate-600">Receive weekly summary of your activities</div>
              </div>
            </label>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </div>
          </div>
        </Card>
        
        {/* Danger Zone */}
        <Card title="Danger Zone" subtitle="Irreversible actions">
          <div className="space-y-4">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
