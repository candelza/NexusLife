# 🚨 Quick Fix: Enable Google OAuth

## Error: "Unsupported provider: provider is not enabled"

This error means Google OAuth is not enabled in your Supabase project.

## Quick Setup (5 minutes):

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Select your project

### 2. Enable Google Provider
1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Enable** (toggle switch)
4. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret

### 3. Get Google OAuth Credentials
If you don't have them yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client IDs**
6. Choose **Web application**
7. Add redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback
   ```
8. Copy the **Client ID** and **Client Secret**

### 4. Test the Fix
1. Save the Google OAuth settings in Supabase
2. Go to your app: http://localhost:8080/auth
3. Click "เข้าสู่ระบบด้วย Google"
4. Should work now! ✅

## Alternative: Use Email Login Only

If you want to skip Google OAuth for now:
- The email login/signup still works perfectly
- Google OAuth can be added later
- All other features are fully functional

## Need Help?

- Check the full guide: `google-oauth-setup.md`
- Or just use email authentication for now 