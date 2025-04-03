import { useState, useEffect } from 'react';
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { ref, get, remove } from 'firebase/database';
import { auth, database } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
    };
    
    fetchUserData();
  }, [user.uid]);
  
  const reauthenticate = async (currentPassword) => {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      setError('Current password is incorrect.');
      return false;
    }
  };
  
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (!newEmail) {
      setError('Please enter a new email address.');
      setLoading(false);
      return;
    }
    
    try {
      const isReauthenticated = await reauthenticate(currentPassword);
      
      if (isReauthenticated) {
        await updateEmail(user, newEmail);
        setSuccess('Email updated successfully!');
        setNewEmail('');
        setCurrentPassword('');
      }
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in before changing your email.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use by another account.');
      } else {
        setError('Failed to update email. Please try again.');
      }
      console.error('Update email error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }
    
    try {
      const isReauthenticated = await reauthenticate(currentPassword);
      
      if (isReauthenticated) {
        await updatePassword(user, newPassword);
        setSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      }
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in before changing your password.');
      } else {
        setError('Failed to update password. Please try again.');
      }
      console.error('Update password error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      setLoading(true);
      try {
        const isReauthenticated = await reauthenticate(currentPassword);
        
        if (isReauthenticated) {
          // Delete user data from database
          await remove(ref(database, `users/${user.uid}`));
          
          // Delete user account
          await deleteUser(user);
          navigate('/login');
        }
      } catch (error) {
        setError('Failed to delete account. Please try again.');
        console.error('Delete account error:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="profile-container">
      <h2>Account Settings</h2>
      
      <div className="profile-card">
        <div className="account-info">
          <h3>Account Information</h3>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Account Created:</span>
            <span className="info-value">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="update-forms">
          <form onSubmit={handleUpdateEmail} className="update-form">
            <h3>Update Email</h3>
            <div className="form-group">
              <label htmlFor="currentPassword1">Current Password</label>
              <input
                type="password"
                id="currentPassword1"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newEmail">New Email</label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
          
          <form onSubmit={handleUpdatePassword} className="update-form">
            <h3>Update Password</h3>
            <div className="form-group">
              <label htmlFor="currentPassword2">Current Password</label>
              <input
                type="password"
                id="currentPassword2"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
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
              />
            </div>
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p>Deleting your account will permanently remove all your data and cannot be undone.</p>
          <button 
            onClick={handleDeleteAccount} 
            className="delete-btn"
            disabled={loading || !currentPassword}
          >
            Delete Account
          </button>
          {!currentPassword && (
            <p className="helper-text">Enter your current password above to enable account deletion.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 