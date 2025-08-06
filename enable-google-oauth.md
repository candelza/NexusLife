# 🔐 Enable Google OAuth - Complete Guide

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing project
3. Enable the Google+ API

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add these authorized redirect URIs:
   ```
   https://yphbtrhnrlkovgqejdcn.supabase.co/auth/v1/callback
   https://nexusbangkoklife.netlify.app/auth/callback
   http://localhost:8080/auth/callback
   ```
5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider in Supabase
1. Go to: https://supabase.com/dashboard/project/yphbtrhnrlkovgqejdcn
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Click **Enable** (toggle switch)
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Save the configuration

### 2.2 Add Redirect URLs in Google Console
Go back to Google Cloud Console and add these URLs:
```
https://yphbtrhnrlkovgqejdcn.supabase.co/auth/v1/callback
https://nexusbangkoklife.netlify.app/auth/callback
http://localhost:8080/auth/callback
```

## Step 3: Update the App

### 3.1 Enable Google OAuth in Production
Once you've configured Google OAuth in Supabase, update the Auth component:

```typescript
// In src/pages/Auth.tsx, remove or comment out this check:
// if (isProduction) {
//   toast({
//     title: "Google OAuth ยังไม่ได้ตั้งค่า",
//     description: "กรุณาตั้งค่า Google OAuth ใน Supabase Dashboard สำหรับ production",
//     variant: "destructive"
//   });
//   return;
// }
```

### 3.2 Show Google Button in Production
Update the conditional rendering:

```typescript
// Change this:
{!isProduction && (
  // Google button
)}

// To this:
{/* Google Login Button */}
<div className="mb-6">
  <Button
    onClick={handleGoogleAuth}
    disabled={isGoogleLoading}
    className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
    variant="outline"
  >
    {/* Google button content */}
  </Button>
</div>
```

## Step 4: Test the Integration

### 4.1 Local Testing
1. Start your development server: `npm run dev`
2. Go to `http://localhost:8080/auth`
3. Click "เข้าสู่ระบบด้วย Google"
4. Complete the OAuth flow

### 4.2 Production Testing
1. Deploy your updated app
2. Go to `https://nexusbangkoklife.netlify.app/auth`
3. Click "เข้าสู่ระบบด้วย Google"
4. Complete the OAuth flow

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Check that redirect URLs match exactly in both Google Console and Supabase
   - Include both HTTP and HTTPS versions for local development

2. **"Client ID not found"**
   - Verify your Google OAuth credentials are correct
   - Make sure the Google+ API is enabled

3. **"Provider not enabled"**
   - Check that Google provider is enabled in Supabase Dashboard
   - Verify the Client ID and Secret are correct

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

## Next Steps

After enabling Google OAuth:
1. Test the complete authentication flow
2. Customize the user profile creation
3. Add additional OAuth providers if needed
4. Implement proper error handling

## Quick Commands

```bash
# Update the app after configuring Google OAuth
git add .
git commit -m "feat: Enable Google OAuth in production"
git push origin main
```

Your Google OAuth should now work in both local and production environments! 🎉 