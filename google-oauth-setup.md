# 🔐 Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback (for local development)
   ```
5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Save the configuration

### 2.2 Add Redirect URLs
In your Google Cloud Console, add these redirect URLs:
```
https://your-project-ref.supabase.co/auth/v1/callback
http://localhost:8080/auth/callback
```

## Step 3: Test the Integration

### 3.1 Local Development
1. Start your development server: `npm run dev`
2. Go to `http://localhost:8080/auth`
3. Click "เข้าสู่ระบบด้วย Google"
4. Complete the OAuth flow

### 3.2 Production
1. Deploy your application
2. Update redirect URLs in Google Cloud Console
3. Update redirect URLs in Supabase Dashboard
4. Test the OAuth flow

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Check that redirect URLs match exactly in both Google Console and Supabase
   - Include both HTTP and HTTPS versions for local development

2. **"Client ID not found"**
   - Verify your Google OAuth credentials are correct
   - Make sure the Google+ API is enabled

3. **"Callback error"**
   - Check that the `/auth/callback` route is properly configured
   - Verify the AuthCallback component is working

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase configuration in dashboard
3. Test with a simple OAuth flow first
4. Check network requests in browser dev tools

## Security Notes

- Keep your Client Secret secure
- Use environment variables for production
- Regularly rotate OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## Environment Variables (Optional)

For production, you can set these environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

After setting up Google OAuth:
1. Test the complete authentication flow
2. Customize the user profile creation
3. Add additional OAuth providers if needed
4. Implement proper error handling 