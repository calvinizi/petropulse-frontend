import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  Activity, Mail, Lock, User, 
  Shield, Camera, ArrowRight, LogIn, Eye, EyeOff 
} from 'lucide-react';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorModal from '../components/common/ErrorModal';
import { useLogin } from '../context/AuthContext';
import { useHttpClient } from '../hooks/HttpHook';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();

  const { login } = useLogin()
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
    watch,
    control
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: '',
      image: null
    }
  });

  const imageFile = watch('image');

  const switchModeHandler = () => {
    setIsLoginMode(prev => !prev);
    reset();
  };

  const onSubmit = async (data) => {
    console.log("Submitting Auth Form:", data);
  
    
    if(isLoginMode){
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
          "POST",
          JSON.stringify({
          email: data.email,
          password: data.password,
          }),
          {
            "Content-Type": "application/json",
          }
      
          );
          login(responseData.id, responseData.token, responseData.role);
          navigate('/');
      } catch (error) {
        // console.log(error);
        
      }
    }
    else{
      try {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('name', data.name);
        formData.append('password', data.password);
        formData.append('role', data.role);
        if (data.image && data.image.length > 0) {
          formData.append('image', data.image[0]);
        }

        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/auth/signup`,
          "POST",
          formData
        );
        login(responseData.id, responseData.token, responseData.role);
        navigate('/'); 
      } catch (error) {
        console.log(error);
        
      }
    }
    
  };

  

  return (
    <>
    <ErrorModal error={error} onClear={clearError} />    
    {isLoading ? <LoadingSpinner asOverlay /> : null}
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        
        {/* Header Section */}
        <div className="auth-header">
          <div className="logo-box">
            <Activity size={32} color="white" />
          </div>
          <h2>{isLoginMode ? 'Welcome Back' : 'Join PetroPulse'}</h2>
          <p>{isLoginMode ? 'Sign in to access your dashboard' : 'Create an account to get started'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          
          {/* Email Field */}
          <div className="form-group">
            <label className="auth-label">
              <Mail size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label className="auth-label">
                <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="auth-label">
              <Lock size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '35%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b'
                }}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label className="auth-label">
                  <Shield size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Role
                </label>
                <div className="input-wrapper">
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                      <Select 
                        className="auth-input"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e)  
                        }}
                      >
                        <option value="">Select a role</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Technician">Technician</option>
                        <option value="Viewer">Viewer</option>
                      </Select> 
                    )}
                  /> 
                </div>
                {errors.role && (
                  <span className="error-message">{errors.role.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="auth-label">Profile Image</label>
                <div className="file-upload-wrapper">
                  <label htmlFor="auth-image" className="file-label">
                    <Camera size={20} />
                    <span>
                      {imageFile && imageFile.length > 0 
                        ? imageFile[0].name 
                        : "Upload Photo"}
                    </span>
                  </label>
                  <input 
                    type="file" 
                    id="auth-image" 
                    accept="image/*"
                    {...register('image', {
                      validate: {
                        fileSize: (files) => {
                          if (!files || files.length === 0) return true;
                          return files[0].size < 5000000 || 'File size must be less than 5MB';
                        },
                        fileType: (files) => {
                          if (!files || files.length === 0) return true;
                          const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/heic'];
                          return acceptedFormats.includes(files[0].type) || 'Only image files are allowed';
                        }
                      }
                    })}
                    style={{display: 'none'}}
                  />
                </div>
                {errors.image && (
                  <span className="error-message">{errors.image.message}</span>
                )}
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="auth-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
            {isLoginMode ? <LogIn size={18}/> : <ArrowRight size={18}/>}
          </Button>

        </form>

        <div className="auth-footer">
          <p>
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <Button type="button" className="text-link" onClick={switchModeHandler}>
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </Button>
          </p>
        </div>

      </div>
    </div>
  </>
  );
};

export default Auth;