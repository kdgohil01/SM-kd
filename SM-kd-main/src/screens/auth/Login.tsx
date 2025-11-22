import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, UserPlus, LogIn, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import './Login.css';

export function Login() {
  const location = useLocation();
  const isSignupPage = location.pathname === '/signup';
  const [isFlipped, setIsFlipped] = useState(isSignupPage);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsFlipped(isSignupPage);
  }, [isSignupPage]);

  const handleFlipToSignup = () => {
    setIsFlipped(true);
    if (location.pathname !== '/signup') {
      navigate('/signup');
    }
  };

  const handleFlipToLogin = () => {
    setIsFlipped(false);
    if (location.pathname !== '/login') {
      navigate('/login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !signupEmail || !signupPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup(signupEmail, signupPassword, name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flip-login-container">
      {/* Stock Master Branding - Outside the flip container */}
      <div className="brand-header-main">
        <img src="/logo.svg" alt="Stock Master" className="brand-logo-main" />
        <h1 className="brand-name-main">Stock Master</h1>
      </div>
      
      <div id="container" className={isFlipped ? 'active' : 'close'}>
        {/* Login Form */}
        <div className="login">
          <div className="content">
            <h1 className="form-title">Log In</h1>
            <form onSubmit={handleLogin}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flip-input"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="flip-input"
              />
              <div className="flip-form-options">
                <span className="remember">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </span>
                <Link to="/forgot-password" className="forget">
                  Forgot password?
                </Link>
                <span className="clearfix"></span>
              </div>
              <Button type="submit" disabled={isLoading || isGoogleLoading} className="flip-button">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Log In
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full flip-button"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-sm">
              <span className="auth-text-muted">Don't have an account? </span>
              <button
                type="button"
                onClick={handleFlipToSignup}
                className="auth-link"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="register">
          <div className="content">
            <h1 className="form-title">Sign Up</h1>
            <form onSubmit={handleSignup}>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="flip-input"
              />
              <Input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={isLoading}
                className="flip-input"
              />
              <Input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                disabled={isLoading}
                className="flip-input"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="flip-input"
              />
              <div className="flip-form-options">
                <span className="remember">
                  <input type="checkbox" id="terms" />
                  <label htmlFor="terms">I accept terms</label>
                </span>
                <span className="clearfix"></span>
              </div>
              <Button type="submit" disabled={isLoading || isGoogleLoading} className="flip-button">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Register
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full flip-button"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <svg className="mr-2 size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-sm">
              <span className="auth-text-muted">Already have an account? </span>
              <button
                type="button"
                onClick={handleFlipToLogin}
                className="auth-link"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>

        {/* Front Page (Sign Up Side) */}
        <div className="page front">
          <div className="content">
            <UserPlus className="size-24 mx-auto mb-4" />
            <h1>Hello, friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <Button
              type="button"
              id="register"
              onClick={handleFlipToSignup}
              className="flip-page-button"
            >
              Register <ArrowRightCircle className="ml-2 size-6" />
            </Button>
          </div>
        </div>

        {/* Back Page (Login Side) */}
        <div className="page back">
          <div className="content">
            <LogIn className="size-24 mx-auto mb-4" />
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <Button
              type="button"
              id="login"
              onClick={handleFlipToLogin}
              className="flip-page-button"
            >
              <ArrowLeftCircle className="mr-2 size-6" /> Log In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
