/**
 * Firebase Cloud Functions - OTP Email System
 * 
 * Secure 6-digit OTP system using:
 * - Firebase Admin SDK (Firestore)
 * - bcryptjs for OTP hashing
 * - Nodemailer for email delivery via Gmail
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Firestore collection name for OTPs
const OTP_COLLECTION = "otps";

// OTP expiry time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;

// Helper function to get Gmail credentials
// Supports both environment variables and Firebase Functions config
const getGmailCredentials = () => {
  // Try environment variables first (for local development)
  let gmailUser = process.env.GMAIL_USER;
  let gmailPassword = process.env.GMAIL_APP_PASSWORD;

  // Fallback to Firebase Functions config (for production)
  if (!gmailUser || !gmailPassword) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config: any = (functions as any).config();
      const gmailConfig = config?.gmail as { user?: string; password?: string } | undefined;
      gmailUser = gmailConfig?.user || gmailUser;
      gmailPassword = gmailConfig?.password || gmailPassword;
    } catch (error) {
      // Config not available, will check below
    }
  }

  if (!gmailUser || !gmailPassword) {
    throw new Error(
      "Gmail credentials not configured. " +
      "Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables, " +
      "or use functions.config().gmail.user and functions.config().gmail.password"
    );
  }

  return { gmailUser, gmailPassword };
};

// Nodemailer transporter configuration for Gmail
// Environment variables required:
// - GMAIL_USER: Your Gmail address
// - GMAIL_APP_PASSWORD: Gmail App Password (not regular password)
const createTransporter = () => {
  const { gmailUser, gmailPassword } = getGmailCredentials();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
};

// Interface for OTP document in Firestore
interface OtpDocument {
  email: string;
  otpHash: string;
  expiresAt: admin.firestore.Timestamp;
  used: boolean;
  createdAt: admin.firestore.Timestamp;
}

/**
 * Generates a random 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send OTP Email Function
 * 
 * POST /sendOtpEmail
 * Body: { email: string }
 * 
 * Generates a 6-digit OTP, hashes it, saves to Firestore, and sends via email
 */
export const sendOtpEmail = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { email } = request.body;

      // Validate input
      if (!email || typeof email !== "string") {
        response.status(400).json({
          success: false,
          error: "Email is required and must be a string",
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        response.status(400).json({
          success: false,
          error: "Invalid email format",
        });
        return;
      }

      // Normalize email (lowercase)
      const normalizedEmail = email.toLowerCase().trim();

      // Generate 6-digit OTP
      const otp = generateOtp();
      logger.info(`Generated OTP for email: ${normalizedEmail}`);

      // Hash OTP using bcrypt
      const saltRounds = 10;
      const otpHash = await bcrypt.hash(otp, saltRounds);

      // Calculate expiry time (10 minutes from now)
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
      );

      // Invalidate any existing unused OTPs for this email
      const existingOtpsSnapshot = await db
        .collection(OTP_COLLECTION)
        .where("email", "==", normalizedEmail)
        .where("used", "==", false)
        .get();

      const batch = db.batch();
      existingOtpsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { used: true });
      });

      // Save new OTP to Firestore
      const otpData: Omit<OtpDocument, "email"> = {
        otpHash,
        expiresAt,
        used: false,
        createdAt: admin.firestore.Timestamp.now(),
      };

      const otpRef = db.collection(OTP_COLLECTION).doc();
      batch.set(otpRef, {
        email: normalizedEmail,
        ...otpData,
      });

      await batch.commit();

      logger.info(`OTP saved to Firestore for email: ${normalizedEmail}`);

      // Send OTP via email using Nodemailer
      const transporter = createTransporter();
      const { gmailUser } = getGmailCredentials();

      const mailOptions = {
        from: `"OTP Service" <${gmailUser}>`,
        to: normalizedEmail,
        subject: "Your OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p>Your one-time password (OTP) is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2196F3; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        `,
        text: `Your OTP code is: ${otp}. This code will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`OTP email sent successfully to: ${normalizedEmail}`);

      // Return success response (don't include OTP in response)
      response.status(200).json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } catch (error) {
      logger.error("Error in sendOtpEmail:", error);
      response.status(500).json({
        success: false,
        error: "Failed to send OTP. Please try again later.",
      });
    }
  }
);

/**
 * Verify OTP Function
 * 
 * POST /verifyOtp
 * Body: { email: string, otp: string }
 * 
 * Validates OTP, checks expiry and usage status, compares hash, marks as used
 */
export const verifyOtp = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { email, otp } = request.body;

      // Validate input
      if (!email || typeof email !== "string") {
        response.status(400).json({
          success: false,
          error: "Email is required and must be a string",
        });
        return;
      }

      if (!otp || typeof otp !== "string") {
        response.status(400).json({
          success: false,
          error: "OTP is required and must be a string",
        });
        return;
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otp)) {
        response.status(400).json({
          success: false,
          error: "OTP must be a 6-digit number",
        });
        return;
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Find the most recent unused OTP for this email
      const otpsSnapshot = await db
        .collection(OTP_COLLECTION)
        .where("email", "==", normalizedEmail)
        .where("used", "==", false)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (otpsSnapshot.empty) {
        response.status(404).json({
          success: false,
          error: "No valid OTP found for this email",
        });
        return;
      }

      const otpDoc = otpsSnapshot.docs[0];
      const otpData = otpDoc.data() as OtpDocument;

      // Check if OTP is expired
      const now = admin.firestore.Timestamp.now();
      if (otpData.expiresAt < now) {
        // Mark as used even though it's expired
        await otpDoc.ref.update({ used: true });

        response.status(400).json({
          success: false,
          error: "OTP has expired. Please request a new one.",
        });
        return;
      }

      // Check if OTP is already used
      if (otpData.used) {
        response.status(400).json({
          success: false,
          error: "OTP has already been used",
        });
        return;
      }

      // Compare provided OTP with hashed OTP using bcrypt
      const isValid = await bcrypt.compare(otp, otpData.otpHash);

      if (!isValid) {
        logger.warn(`Invalid OTP attempt for email: ${normalizedEmail}`);
        response.status(400).json({
          success: false,
          error: "Invalid OTP",
        });
        return;
      }

      // Mark OTP as used
      await otpDoc.ref.update({ used: true });

      logger.info(`OTP verified successfully for email: ${normalizedEmail}`);

      // Return success response
      response.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      logger.error("Error in verifyOtp:", error);
      response.status(500).json({
        success: false,
        error: "Failed to verify OTP. Please try again later.",
      });
    }
  }
);

/**
 * Reset Password Function
 * 
 * POST /resetPassword
 * Body: { email: string, newPassword: string }
 * 
 * Updates user password using Firebase Admin SDK
 * Note: This requires OTP to be verified first (email must have verified OTP)
 */
export const resetPassword = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { email, newPassword } = request.body;

      // Validate input
      if (!email || typeof email !== "string") {
        response.status(400).json({
          success: false,
          error: "Email is required and must be a string",
        });
        return;
      }

      if (!newPassword || typeof newPassword !== "string") {
        response.status(400).json({
          success: false,
          error: "New password is required and must be a string",
        });
        return;
      }

      // Validate password length
      if (newPassword.length < 8) {
        response.status(400).json({
          success: false,
          error: "Password must be at least 8 characters long",
        });
        return;
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Verify that OTP was verified for this email (check if there's a used OTP)
      const verifiedOtpsSnapshot = await db
        .collection(OTP_COLLECTION)
        .where("email", "==", normalizedEmail)
        .where("used", "==", true)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (verifiedOtpsSnapshot.empty) {
        response.status(400).json({
          success: false,
          error: "OTP not verified. Please verify OTP first.",
        });
        return;
      }

      // Check if OTP was verified recently (within last 30 minutes)
      const verifiedOtp = verifiedOtpsSnapshot.docs[0].data() as OtpDocument;
      const thirtyMinutesAgo = admin.firestore.Timestamp.fromMillis(
        Date.now() - 30 * 60 * 1000
      );

      if (verifiedOtp.createdAt < thirtyMinutesAgo) {
        response.status(400).json({
          success: false,
          error: "OTP verification expired. Please verify OTP again.",
        });
        return;
      }

      // Get user by email using Firebase Admin Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(normalizedEmail);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          response.status(404).json({
            success: false,
            error: "No account found with this email address",
          });
          return;
        }
        throw error;
      }

      // Update password using Firebase Admin SDK
      await admin.auth().updateUser(userRecord.uid, {
        password: newPassword,
      });

      logger.info(`Password reset successfully for email: ${normalizedEmail}`);

      // Return success response
      response.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      logger.error("Error in resetPassword:", error);
      response.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again later.",
      });
    }
  }
);
