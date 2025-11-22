import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, UserPlus, LogIn, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
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
  const { login, signup } = useAuth();
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
              <Button type="submit" disabled={isLoading} className="flip-button">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Log In
              </Button>
            </form>
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
              <Button type="submit" disabled={isLoading} className="flip-button">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Register
              </Button>
            </form>
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
