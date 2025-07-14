/*
  # Add Email Field to User Profiles
  
  This migration adds an email field to the user_profiles table
  so we can store user emails for the admin dashboard.
*/

-- Add email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Create an index on the email column for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update existing user profiles with email from auth.users (if possible)
-- This would need to be done manually or through a trigger
-- For now, we'll leave it as is and let the application handle it

-- Add a comment to explain the purpose
COMMENT ON COLUMN user_profiles.email IS 'User email address for admin dashboard display'; 