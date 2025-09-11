-- Migration: Create OTP verifications table
-- Description: Create table for WhatsApp OTP verification system
-- Date: 2025-09-10

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS "otp_verifications" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "mobile_number" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "is_used" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "used_at" TIMESTAMP,
  "user_id" TEXT
);

-- Add mobile_number column to users table if it doesn't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mobile_number" TEXT UNIQUE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "otp_mobile_number_idx" ON "otp_verifications" ("mobile_number");
CREATE INDEX IF NOT EXISTS "otp_otp_idx" ON "otp_verifications" ("otp");
CREATE INDEX IF NOT EXISTS "otp_expires_at_idx" ON "otp_verifications" ("expires_at");

-- Add comments for documentation
COMMENT ON TABLE "otp_verifications" IS 'Stores OTP verification codes for WhatsApp authentication';
COMMENT ON COLUMN "otp_verifications"."mobile_number" IS 'Mobile number in international format (e.g., 919876543210)';
COMMENT ON COLUMN "otp_verifications"."otp" IS '6-digit OTP code';
COMMENT ON COLUMN "otp_verifications"."expires_at" IS 'When the OTP expires (typically 10 minutes from creation)';
COMMENT ON COLUMN "otp_verifications"."is_used" IS 'Whether the OTP has been used for verification';
COMMENT ON COLUMN "otp_verifications"."user_id" IS 'ID of user who successfully verified with this OTP';
COMMENT ON COLUMN "users"."mobile_number" IS 'User mobile number for WhatsApp authentication';
