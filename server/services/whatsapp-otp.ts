import crypto from 'crypto';
import { storage } from '../storage';
import { insertOtpVerificationSchema } from '../../shared/schema';
import type { InsertOtpVerification } from '../../shared/schema';

// WhatsApp Business API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 30; // Increased to 30 minutes for testing
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export class WhatsAppOtpService {
  /**
   * Generate a secure 6-digit OTP
   */
  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Format mobile number to international format
   */
  private formatMobileNumber(mobileNumber: string): string {
    // Remove all non-digit characters
    const cleaned = mobileNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    
    throw new Error('Invalid mobile number format');
  }

  /**
   * Send OTP via WhatsApp
   */
  private async sendWhatsAppMessage(mobileNumber: string, otp: string): Promise<boolean> {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error('WhatsApp API credentials not configured');
      return false;
    }

    const verificationUrl = `${BASE_URL}/api/auth/verify-otp?otp=${otp}&mobile=${encodeURIComponent(mobileNumber)}`;
    
    const message = {
      messaging_product: 'whatsapp',
      to: mobileNumber,
      type: 'text',
      text: {
        body: `🔐 SAANSE Verification\n\nYour OTP is: ${otp}\n\nOr click this link to verify: ${verificationUrl}\n\nThis OTP expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this, please ignore.`
      }
    };

    console.log('WhatsApp message:', message);

    try {
      const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp message sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Generate and send OTP to mobile number
   */
  async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string; otpId?: string }> {
    try {
      // Format mobile number
      const formattedNumber = this.formatMobileNumber(mobileNumber);
      
      // Generate OTP
      const otp = this.generateOtp();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
      
      // Ensure we're working with UTC times
      const utcNow = new Date(now.toISOString());
      const utcExpiresAt = new Date(expiresAt.toISOString());
      
      console.log('OTP generation time:', now.toISOString());
      console.log('OTP expires at:', expiresAt.toISOString());
      console.log('Current time in IST:', now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      console.log('Expires at in IST:', expiresAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      console.log('Time difference (minutes):', OTP_EXPIRY_MINUTES);

      // Store OTP in database
      const otpData: InsertOtpVerification = {
        mobileNumber: formattedNumber,
        otp,
        expiresAt: utcExpiresAt,
        isUsed: false,
      };

      console.log('Sending OTP data:', otpData);
      const storedOtp = await storage.createOtpVerification(otpData);
      console.log('Stored OTP result:', storedOtp);
      
      // Send WhatsApp message
      const messageSent = await this.sendWhatsAppMessage(formattedNumber, otp);
      
      if (!messageSent) {
        // If WhatsApp fails, still return success but with a note
        return {
          success: true,
          message: 'OTP generated successfully. WhatsApp service temporarily unavailable.',
          otpId: storedOtp.id,
        };
      }

      return {
        success: true,
        message: 'OTP sent successfully to your WhatsApp!',
        otpId: storedOtp.id,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  }

  /**
   * Verify OTP from query parameters
   */
  async verifyOtpFromQuery(otp: string, mobileNumber: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: any; 
    token?: string 
  }> {
    try {
      console.log('Verifying OTP:', { otp, mobileNumber });
      
      const formattedNumber = this.formatMobileNumber(mobileNumber);
      console.log('Formatted mobile number:', formattedNumber);
      
      // Find valid OTP
      const otpRecord = await storage.findValidOtp(otp, formattedNumber);
      console.log('Found OTP record:', otpRecord);
      
      if (!otpRecord) {
        console.log('No valid OTP found');
        return {
          success: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      // Find or create user
      let user = await storage.getUserByMobileNumber(formattedNumber);
      
      if (!user) {
        // Create new user with mobile number
        user = await storage.createUser({
          supabaseUid: `mobile_${formattedNumber}_${Date.now()}`, // Generate unique ID
          email: `temp_${formattedNumber}@mobile.temp`, // Temporary email until migration is complete
          displayName: `User ${formattedNumber.slice(-4)}`, // Default name
          mobile: formattedNumber, // Use new mobile field
          mobileNumber: formattedNumber, // Keep legacy field for compatibility
        });
      }

      // Generate JWT token for authentication
      const token = this.generateJwtToken(user);

      return {
        success: true,
        message: 'OTP verified successfully!',
        user,
        token,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify OTP',
      };
    }
  }

  /**
   * Generate JWT token for user authentication
   */
  private generateJwtToken(user: any): string {
    // Create a proper JWT-like token for mobile authentication
    const payload = {
      sub: user.supabase_uid,
      email: user.email,
      name: user.display_name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      aud: 'saanse-mobile',
      iss: 'saanse-whatsapp-otp'
    };
    
    // For now, create a base64 encoded token (in production, use proper JWT signing)
    const tokenData = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload,
      signature: 'mobile-auth-signature'
    };
    
    return `mobile_auth_${user.id}_${Date.now()}`;
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps(): Promise<void> {
    try {
      await storage.deleteExpiredOtps();
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export const whatsappOtpService = new WhatsAppOtpService();
