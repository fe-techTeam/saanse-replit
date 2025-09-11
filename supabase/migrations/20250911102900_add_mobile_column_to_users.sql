-- Add mobile column to users table if it doesn't exist
DO $$ 
BEGIN
    -- Check if mobile column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'mobile'
    ) THEN
        ALTER TABLE "public"."users" ADD COLUMN "mobile" text UNIQUE;
        CREATE INDEX "users_mobile_idx" ON "public"."users" USING btree ("mobile");
    END IF;
    
    -- Update existing mobile users to move mobile number from mobile_number to mobile
    UPDATE "public"."users" 
    SET "mobile" = "mobile_number"
    WHERE "mobile_number" IS NOT NULL AND "mobile" IS NULL;
    
    -- Clear fake email addresses for mobile users and set email to null
    UPDATE "public"."users" 
    SET "email" = NULL
    WHERE "email" LIKE '%@mobile.saanse.com';
    
END $$;

-- Make email nullable since mobile users won't have email
ALTER TABLE "public"."users" ALTER COLUMN "email" DROP NOT NULL;

-- Add constraint to ensure either email or mobile is present
ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_or_mobile_check" 
CHECK (("email" IS NOT NULL) OR ("mobile" IS NOT NULL));
