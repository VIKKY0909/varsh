import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  validateSignUpForm, 
  validateSignInForm, 
  validateField, 
  getPasswordStrength 
} from '../lib/validation';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Real-time validation for password strength
    if (name === 'password' && !isLogin) {
      const passwordStrength = getPasswordStrength(value);
      // You can use passwordStrength for UI feedback
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field on blur
    const error = validateField(fieldName, formData[fieldName as keyof typeof formData], formData);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    let validationResult;
    
    if (isLogin) {
      validationResult = validateSignInForm({
        email: formData.email,
        password: formData.password
      });
    } else {
      validationResult = validateSignUpForm(formData);
    }
    
    setErrors(validationResult.errors);
    return validationResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = isLogin ? ['email', 'password'] : ['email', 'password', 'confirmPassword', 'fullName', 'phone'];
    const newTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(newTouched);
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setErrors({ submit: error.message });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          phone: formData.phone
        });
        if (error) {
          setErrors({ submit: error.message });
        } else {
          // Show success message and switch to login
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', confirmPassword: '', fullName: '', phone: '' });
          setErrors({});
          setTouched({});
          // You might want to show a success toast here
        }
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthIndicator = () => {
    if (isLogin || !formData.password) return null;
    
    const strength = getPasswordStrength(formData.password);
    const strengthColors = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500'
    };
    
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1 w-8 rounded-full ${
                  level <= strength.score ? strengthColors[strength.color as keyof typeof strengthColors] : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-medium ${
            strength.color === 'red' ? 'text-red-600' :
            strength.color === 'orange' ? 'text-orange-600' :
            strength.color === 'yellow' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Password must contain uppercase, lowercase, number, and special character
        </p>
      </div>
    );
  };

  const getFieldError = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName];
  };

  const getFieldSuccess = (fieldName: string) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName as keyof typeof formData];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-mahogany mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to your account to continue shopping' 
              : 'Join us to discover beautiful kurtis'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Sign Up only) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-mahogany mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('fullName')}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent transition-colors ${
                      getFieldError('fullName') ? 'border-red-500' :
                      getFieldSuccess('fullName') ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {getFieldSuccess('fullName') && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                  {getFieldError('fullName') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                  )}
                </div>
                {getFieldError('fullName') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('fullName')}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-mahogany mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent transition-colors ${
                    getFieldError('email') ? 'border-red-500' :
                    getFieldSuccess('email') ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {getFieldSuccess('email') && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
                {getFieldError('email') && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                )}
              </div>
              {getFieldError('email') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone (Sign Up only) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-mahogany mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent transition-colors ${
                      getFieldError('phone') ? 'border-red-500' :
                      getFieldSuccess('phone') ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {getFieldSuccess('phone') && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                  {getFieldError('phone') && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                  )}
                </div>
                {getFieldError('phone') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-mahogany mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent transition-colors ${
                    getFieldError('password') ? 'border-red-500' :
                    getFieldSuccess('password') ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('password')}</p>
              )}
              {!isLogin && getPasswordStrengthIndicator()}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-mahogany mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent transition-colors ${
                      getFieldError('confirmPassword') ? 'border-red-500' :
                      getFieldSuccess('confirmPassword') ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {getFieldError('confirmPassword') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('confirmPassword')}</p>
                )}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-gold to-copper text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setTouched({});
                  setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '' });
                }}
                className="ml-2 text-rose-gold hover:text-rose-800 font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <a href="/terms" className="text-rose-gold hover:text-rose-800 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-rose-gold hover:text-rose-800 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;