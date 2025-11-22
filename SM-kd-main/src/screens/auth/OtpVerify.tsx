import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Mail, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { verifyOtp } from '../../api/otp';
import './ForgotPassword.css';

export function OtpVerify() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('otp_email');
    if (!storedEmail) {
      toast.error('Email not found. Please start over.');
      navigate('/forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please start over.');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success('OTP verified successfully!');
      
      // Navigate to reset password screen
      navigate('/reset-password');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      
      // Handle specific error cases
      if (errorMessage.includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (errorMessage.includes('used')) {
        toast.error('OTP has already been used. Please request a new one.');
      } else if (errorMessage.includes('Invalid')) {
        toast.error('Invalid OTP. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email not found. Please start over.');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    try {
      const { sendOtp } = await import('../../api/otp');
      await sendOtp(email);
      toast.success('New OTP sent successfully! Please check your email.');
      setOtp(''); // Clear the current OTP input
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="brand-header">
            <img src="/logo.svg" alt="Stock Master" className="brand-logo mx-auto mb-2" style={{width: '48px', height: '48px'}} />
            <h2 className="brand-name text-xl font-bold mb-4">Stock Master</h2>
          </div>
          <div>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your email
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                OTP sent to <span className="font-medium">{email}</span>
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 size-4" />
                  Verify OTP
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                <Mail className="mr-2 size-4" />
                Resend OTP
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/forgot-password')}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

