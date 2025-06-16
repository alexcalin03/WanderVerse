import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';
import { updateUser, updateUserPassword } from '../../api/auth';
import axios from 'axios';
import UserPreferencesModal from '../../components/UserPreferencesModal/UserPreferencesModal';

const Account = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://127.0.0.1:8000/current_user/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        setUserData(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email || '');
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await updateUser(username, email);
      setUserData({ ...userData, username, email });
      setShowUpdateUserModal(false);
      alert('User information updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update user information');
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      await updateUserPassword(currentPassword, newPassword);
      setShowUpdatePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };
  
  const handleBackHome = () => {
    navigate('/');
  };
  
  if (loading) {
    return <div className="account-container loading">Loading...</div>;
  }
  
  return (
    <div className="account-container">
      <h1>Account Information</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="account-info">
        <div className="info-item">
          <strong>Username:</strong> 
          <span>{userData?.username}</span>
        </div>
        <div className="info-item">
          <strong>Email:</strong> 
          <span>{userData?.email || 'Not provided'}</span>
        </div>
        <div className="info-item">
          <strong>Password:</strong> 
          <span className="password-hash">{userData?.password_hash || '********'}</span>
        </div>
      </div>
      
      <div className="account-actions">
        <button 
          className="action-button update-user" 
          onClick={() => setShowUpdateUserModal(true)}
        >
          Update User Information
        </button>
        
        <button 
          className="action-button update-password" 
          onClick={() => setShowUpdatePasswordModal(true)}
        >
          Update Password
        </button>
        
        <button 
          className="action-button preferences" 
          onClick={() => setShowPreferencesModal(true)}
        >
          Travel Preferences
        </button>
        
        <button 
          className="action-button back-home" 
          onClick={handleBackHome}
        >
          Back to Home
        </button>
      </div>
      
      {showUpdateUserModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Update User Information</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="modal-button save">Save Changes</button>
                <button 
                  type="button" 
                  className="modal-button cancel" 
                  onClick={() => {
                    setShowUpdateUserModal(false);
                    setUsername(userData?.username || '');
                    setEmail(userData?.email || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <UserPreferencesModal
        show={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
      
      {showUpdatePasswordModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Update Password</h2>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="modal-button save">Update Password</button>
                <button 
                  type="button" 
                  className="modal-button cancel" 
                  onClick={() => {
                    setShowUpdatePasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;