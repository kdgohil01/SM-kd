/**
 * OTP API Helper Functions
 * 
 * Handles communication with Firebase Cloud Functions for OTP operations
 */

const PROJECT_ID = 'odoo-x-spit';
const FUNCTIONS_EMULATOR_URL = `http://localhost:5001/${PROJECT_ID}/us-central1`;

// Determine if we're in development (using emulator) or production
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const BASE_URL = isDevelopment 
  ? FUNCTIONS_EMULATOR_URL 
  : `https://us-central1-${PROJECT_ID}.cloudfunctions.net`;

/**
 * Sends OTP to the specified email address
 * @param email - User's email address
 * @throws Error if the request fails
 */
export async function sendOtp(email: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/sendOtpEmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Failed to send OTP';
    throw new Error(errorMessage);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to send OTP');
  }
}

/**
 * Verifies the OTP for the specified email address
 * @param email - User's email address
 * @param otp - 6-digit OTP code
 * @throws Error if the OTP is invalid, expired, or already used
 */
export async function verifyOtp(email: string, otp: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/verifyOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Failed to verify OTP';
    throw new Error(errorMessage);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to verify OTP');
  }
}

/**
 * Resets the password for the specified email address
 * @param email - User's email address
 * @param newPassword - New password (must be at least 8 characters)
 * @throws Error if the password reset fails
 */
export async function resetPassword(email: string, newPassword: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/resetPassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Failed to reset password';
    throw new Error(errorMessage);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to reset password');
  }
}

