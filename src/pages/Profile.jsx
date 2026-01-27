import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Save, User, Mail, Lock, Shield } from 'lucide-react';

import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ErrorModal from '../components/common/ErrorModal';


import { useHttpClient } from '../hooks/HttpHook';
import { useLogin } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';

import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { token } = useLogin();
  const { sendRequest, isLoading, error, clearError } = useHttpClient();
  const { currentUser, refetch } = useCurrentUser();
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: '',
      password: ''
    }
  });

 
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        password: ''
      });
      
      if (currentUser.avatar && !avatarFile) {
        setAvatarPreview(`${process.env.REACT_APP_ASSET_URL}/${currentUser.avatar}`);
      }
    }
  }, [currentUser, reset, avatarFile]);

  
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showDeleteWarningHandler = (e) => {
    e.stopPropagation()
    setShowConfirmModal(true);
  };

   const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };


  const onSubmit = async (data) => {
  if (!currentUser) return;

  try {
    const formData = new FormData();
    formData.append('name', data.name);
    
    if (data.password && data.password.trim()) {
      formData.append('password', data.password);
    }
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/user/${currentUser.id}`,
      'PUT',
      formData,
      {
        Authorization: 'Bearer ' + token
      }
    );

    refetch();
    
    setAvatarFile(null);
    
    reset({
      name: data.name,
      email: currentUser.email,
      role: currentUser.role,
      password: ''
    });

    setShowConfirmModal(false);
    
    setTimeout(() => {
      alert('Profile updated successfully!');
    }, 300);
    
  } catch (error) {
    console.log('Error updating profile:', error);
  }
};

  if (!currentUser && !isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h2>User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}


      <Modal 
              show={showConfirmModal}
              onCancel={cancelDeleteHandler}
              header="Are you sure?" 
              footer={
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%'}}>
                  <Button variant="secondary" onClick={cancelDeleteHandler}>
                    CANCEL
                  </Button>
                  <Button 
                    onClick={handleSubmit(onSubmit)}
                    style={{backgroundColor: '#dc2626', color: 'white'}}
                  >
                    UPDATE
                  </Button>
                </div>
              }
            >
              <p>
                Do you want to proceed and update the profile <strong>{currentUser?.email || "N/A"}</strong>? 
                Please note that this action cannot be undone.
              </p>
            </Modal>
      

      <div className="animate-fade-in">
        <div className="page-header">
          <h2>My Profile</h2>
          <p style={{ color: '#64748b' }}>Manage your account settings</p>
        </div>

        <form className="profile-layout">
          <div className="profile-sidebar">
            <div className="card avatar-card">
              <h3>Profile Picture</h3>
              
              <div className="avatar-container">
                <div className="avatar-circle">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <User size={48} color="#94a3b8" />
                  )}
                </div>
                
                <label htmlFor="avatar-upload" className="camera-btn">
                  <Camera size={18} />
                </label>
                
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              <p style={{ 
                textAlign: 'center', 
                color: '#64748bff', 
                fontSize: '0.85rem',
                marginTop: '1rem'
              }}>
                Click the camera icon to change your photo
              </p>
            </div>

            <div className="card">
              <h3>Account Status</h3>
              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">Account Type</span>
                  <span className="status-value">{currentUser?.role}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Member Since</span>
                  <span className="status-value">
                    {currentUser?.createdAt 
                      ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Fields */}
          <div className="profile-main">
            <div className="card">
              <h3>Personal Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    readOnly
                    style={{ cursor: 'not-allowed' }}
                    {...register('email')}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Email cannot be changed
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Shield size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Role
                  </label>
                  <Input
                    type="text"
                    readOnly
                    style={{ cursor: 'not-allowed' }}
                    {...register('role')}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Role cannot be changed
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Leave empty to keep current password"
                    {...register('password', {
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Only fill this if you want to change your password
                  </span>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '2rem' }}>
                <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button onClick={showDeleteWarningHandler} icon={Save} type="button">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;