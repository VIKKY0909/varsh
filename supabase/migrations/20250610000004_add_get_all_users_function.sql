/*
  # Add Get All Users Function for Admin Dashboard
  
  This migration adds a function to get all users with complete profile information
  for the admin dashboard without requiring admin privileges.
*/

-- Create a function to get all users with complete information
CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  phone text,
  gender text,
  date_of_birth date,
  is_admin boolean,
  created_at timestamptz,
  profile_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    up.full_name,
    up.phone,
    up.gender,
    up.date_of_birth,
    up.is_admin,
    au.created_at,
    CASE 
      WHEN up.full_name IS NOT NULL AND up.phone IS NOT NULL THEN 'Profile Complete'
      ELSE 'Profile Incomplete'
    END as profile_status
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.user_id
  WHERE au.deleted_at IS NULL
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_for_admin() TO authenticated;

-- Test the function (optional)
-- SELECT * FROM get_all_users_for_admin(); 