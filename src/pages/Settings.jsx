import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    major: user?.major || '',
    graduationYear: user?.graduationYear || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    groupInvites: user?.settings?.groupInvites ?? true,
    studyReminders: user?.settings?.studyReminders ?? true,
    weeklyDigest: user?.settings?.weeklyDigest ?? true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.settings?.profileVisibility || 'public',
    showEmail: user?.settings?.showEmail ?? false,
    showUniversity: user?.settings?.showUniversity ?? true
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would call your backend API
      await updateUserProfile(profileData);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call your auth service
      showSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showError('Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
        showSuccess('Profile picture updated!');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showError('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const removeProfilePicture = () => {
    setProfileData(prev => ({ ...prev, profilePicture: null }));
    showSuccess('Profile picture removed');
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // In a real app, this would update user settings
      showSuccess('Notification preferences updated!');
    } catch (error) {
      showError('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      // In a real app, this would update user settings
      showSuccess('Privacy settings updated!');
    } catch (error) {
      showError('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This will permanently delete all your data, including groups, messages, and study materials. Are you absolutely sure?'
      );
      
      if (doubleConfirm) {
        setLoading(true);
        try {
          // In a real app, this would call the delete account API
          showSuccess('Account deletion requested. You will receive a confirmation email.');
        } catch (error) {
          showError('Failed to delete account. Please contact support.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                Upload Photo
              </Button>
              {profileData.profilePicture && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={removeProfilePicture}
                  className="ml-2"
                >
                  Remove
                </Button>
              )}
              <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University
              </label>
              <input
                type="text"
                value={profileData.university}
                onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                placeholder="e.g., Stanford University"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major
              </label>
              <input
                type="text"
                value={profileData.major}
                onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                placeholder="e.g., Computer Science"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year
              </label>
              <select
                value={profileData.graduationYear}
                onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {[...Array(10)].map((_, i) => {
                  const year = new Date().getFullYear() + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              placeholder="Tell others about yourself, your interests, or study goals..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : 'Update Profile'}
          </Button>
        </form>
      </Card>

      {/* Password Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
        
        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            Update Password
          </Button>
        </form>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive emails about important updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Group Invites</h3>
              <p className="text-sm text-gray-500">Get notified when invited to study groups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.groupInvites}
                onChange={(e) => setNotifications(prev => ({ ...prev, groupInvites: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Study Reminders</h3>
              <p className="text-sm text-gray-500">Reminders for upcoming study sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.studyReminders}
                onChange={(e) => setNotifications(prev => ({ ...prev, studyReminders: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Weekly Digest</h3>
              <p className="text-sm text-gray-500">Weekly summary of your study activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={(e) => setNotifications(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <Button onClick={handleNotificationUpdate} variant="outline" disabled={loading}>
            Save Notification Preferences
          </Button>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Anyone can find you</option>
              <option value="university">University Only - Students from your university</option>
              <option value="private">Private - Only people you invite</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Show Email Address</h3>
              <p className="text-sm text-gray-500">Allow others to see your email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.showEmail}
                onChange={(e) => setPrivacy(prev => ({ ...prev, showEmail: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Show University</h3>
              <p className="text-sm text-gray-500">Display your university on your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.showUniversity}
                onChange={(e) => setPrivacy(prev => ({ ...prev, showUniversity: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <Button onClick={handlePrivacyUpdate} variant="outline" disabled={loading}>
            Save Privacy Settings
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Delete Account</h3>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. This will permanently delete 
            your profile, study groups, messages, and all associated data.
          </p>
          <Button 
            variant="outline" 
            onClick={deleteAccount}
            className="border-red-300 text-red-700 hover:bg-red-50"
            disabled={loading}
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;