/*
  # Add User Emails Function for Admin Dashboard
  
  This migration adds a function to safely get user emails for the admin dashboard
  without requiring admin privileges.
*/

-- Create a function to get user emails safely
CREATE OR REPLACE FUNCTION get_user_emails(user_ids uuid[])
RETURNS TABLE(user_id uuid, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails(uuid[]) TO authenticated;

-- Test the function (optional)
-- SELECT * FROM get_user_emails(ARRAY['user-id-here']::uuid[]); 