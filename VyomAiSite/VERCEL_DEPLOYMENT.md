# Vercel Deployment Guide for VyomAi

## Prerequisites

1. **Cloud Database**: You need a PostgreSQL database accessible from the internet.
   - **Recommended**: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (easiest), [Neon](https://neon.tech), or [Supabase](https://supabase.com)
   - Get your `DATABASE_URL` (format: `postgresql://user:password@host:port/database`)

2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Deployment Steps

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Environment Variables**:
   In the Vercel dashboard, add these variables:

   ```
   DATABASE_URL=<your-cloud-postgres-url>
   OPENAI_API_KEY=<your-openai-api-key>
   SESSION_SECRET=<generate-random-string>
   SOCIAL_MEDIA_ENCRYPTION_KEY=1fbe000c311ee466c7eeb3060d7913a850cbed432ad790c7a64e12f8b948745c
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=info@vyomai.cloud
   SMTP_PASSWORD=ciym avzm jrtd mtsj
   SMTP_FROM=info@vyomai.cloud
   SMTP_FROM_NAME=VyomAi
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   NODE_ENV=production
   ```

### 4. Setup Vercel Cron Jobs
Since Vercel Serverless Functions are ephemeral, the background `node-cron` scheduler won't run. To keep social media stats updated:
1. Create a `vercel.json` (if not present) with a `crons` section.
2. In the Vercel Dashboard, go to **Settings > Cron Jobs**.
3. Create a job to trigger `/api/admin/social-media/sync-all` at your desired interval.

Note: You may need a "Bypass Secret" or to ensure the endpoint is accessible to Vercel's cron agent.

### 5. Deploy
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel
   ```

   - Follow prompts
   - Add environment variables when prompted

## Post-Deployment

1. **Run Database Migrations**:
   - The session table will be created automatically
   - Run `npm run db:push` locally with your cloud `DATABASE_URL` to sync schema

2. **Test Your Site**:
   - Visit your Vercel URL
   - Try logging in at `/admin`
   - Test the chatbot
   - Send a test contact form

## Troubleshooting

- **Login fails**: Check `SESSION_SECRET` is set
- **Database errors**: Verify `DATABASE_URL` is correct and database is accessible
- **Build fails**: Check build logs in Vercel dashboard
- **Email not sending**: Verify SMTP credentials

## Important Notes

- **Local PostgreSQL won't work**: Vercel can't access `localhost`
- **Environment variables are required**: The app won't work without them
- **Session persistence**: Sessions are now stored in PostgreSQL, so login will persist across deployments
