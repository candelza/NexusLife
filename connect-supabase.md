# 🔗 Connect to Supabase - Step by Step Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `faith-nexus-hub`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"

## Step 2: Get Project Credentials

After project creation, go to:
1. **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Client Configuration

Replace the values in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key-here";
```

## Step 4: Link Local Project

Run these commands in terminal:

```bash
# Login to Supabase (if needed)
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push local migrations to cloud
supabase db push
```

## Step 5: Test Connection

1. Restart your dev server: `npm run dev`
2. Test the app at http://localhost:8080
3. Try creating a profile or prayer request

## Troubleshooting

- **Port conflicts**: Use `supabase stop` before `supabase start`
- **Migration errors**: Use `supabase db reset` to start fresh
- **Auth issues**: Check your API keys in the dashboard

## Current Status

✅ Local Supabase running at: http://127.0.0.1:54321
✅ Development server running at: http://localhost:8080
⏳ Waiting for cloud project connection... 