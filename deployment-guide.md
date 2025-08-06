# 🚀 Deployment Guide - Netlify

## Quick Fix for 404 Errors

The 404 error you're seeing is because Netlify doesn't know how to handle React Router routes. I've added the necessary configuration files to fix this.

## Files Added:

### 1. `public/_redirects`
```
/*    /index.html   200
```
This tells Netlify to serve `index.html` for all routes, allowing React Router to handle routing.

### 2. `netlify.toml`
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deployment Steps:

### 1. Build Locally (Optional)
```bash
npm run build
```

### 2. Deploy to Netlify

#### Option A: Drag & Drop
1. Run `npm run build`
2. Drag the `dist` folder to Netlify dashboard

#### Option B: Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically

#### Option C: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

## Environment Variables

Set these in your Netlify dashboard:

### For Production Supabase:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### For Local Development:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

## Troubleshooting

### 404 Errors:
- ✅ Fixed with `_redirects` file
- ✅ Fixed with `netlify.toml` configuration

### Build Errors:
- Check Node.js version (use 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### Environment Issues:
- Ensure environment variables are set in Netlify
- Check Supabase configuration
- Verify API keys are correct

## Testing Deployment

1. **Local Test**: `npm run build && npm run preview`
2. **Netlify Test**: Check the deployed URL
3. **Route Test**: Try navigating to different pages

## Custom Domain (Optional)

1. Go to Netlify dashboard
2. Site settings → Domain management
3. Add custom domain
4. Update DNS records

## Performance Tips

- Enable Netlify's CDN
- Use image optimization
- Enable gzip compression
- Set proper cache headers

## Security

- Use environment variables for secrets
- Enable HTTPS
- Set up proper CORS headers
- Configure CSP headers if needed

## Monitoring

- Enable Netlify Analytics
- Set up error tracking
- Monitor build logs
- Check performance metrics

Your app should now deploy correctly without 404 errors! 🎉 