-- Enable Google OAuth provider
-- This migration enables Google OAuth authentication in Supabase

-- Note: You need to configure Google OAuth in your Supabase dashboard:
-- 1. Go to Authentication > Providers
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials (Client ID and Client Secret)
-- 4. Add redirect URLs in your Google Cloud Console

-- The actual OAuth configuration is done through the Supabase dashboard
-- This migration is a placeholder for documentation purposes

-- You can also enable Google OAuth via SQL if needed:
-- INSERT INTO auth.providers (id, name, enabled, config)
-- VALUES ('google', 'google', true, '{"client_id": "your-client-id", "client_secret": "your-client-secret"}')
-- ON CONFLICT (id) DO UPDATE SET enabled = true, config = EXCLUDED.config; 