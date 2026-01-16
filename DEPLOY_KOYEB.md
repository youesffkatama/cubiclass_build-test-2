# Deploying Scholar.AI on Koyeb

This guide will walk you through deploying the Scholar.AI application on Koyeb.

## Prerequisites

Before deploying, you'll need:

1. A [Koyeb Account](https://www.koyeb.com/)
2. A [MongoDB Atlas Account](https://www.mongodb.com/atlas) for the database
3. A [Redis Cloud Account](https://redis.com/) or compatible Redis provider
4. An [OpenRouter Account](https://openrouter.ai/) for AI API access

## Step 1: Prepare Your Environment Variables

You'll need to gather the following environment variables:

### Database Configuration
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `REDIS_HOST`: Your Redis host
- `REDIS_PORT`: Your Redis port
- `REDIS_PASSWORD`: Your Redis password

### Security Configuration
- `JWT_SECRET`: A secure JWT secret (at least 32 characters)
- `JWT_REFRESH_SECRET`: A secure refresh token secret (at least 32 characters)

### AI Service Configuration
- `OPENROUTER_API_KEY`: Your OpenRouter API key

### Application Configuration
- `NODE_ENV`: Set to `production`
- `PORT`: Port number (Koyeb will provide this, typically 8080)
- `FRONTEND_URL`: Your application URL (will be set automatically by Koyeb)

## Step 2: Deploy to Koyeb

### Option 1: Using the Koyeb CLI

1. Install the Koyeb CLI:
```bash
curl -sfL https://get.koyeb.com/ | sh
```

2. Authenticate:
```bash
koyeb login
```

3. Deploy the application:
```bash
koyeb app init scholar-ai --type web
koyeb deployment create scholar-ai --git github.com/YOUR_USERNAME/SCHOLAR_AI_REPO --env MONGODB_URI=your_mongodb_uri --env REDIS_HOST=your_redis_host --env REDIS_PORT=your_redis_port --env REDIS_PASSWORD=your_redis_password --env JWT_SECRET=your_jwt_secret --env JWT_REFRESH_SECRET=your_refresh_secret --env OPENROUTER_API_KEY=your_openrouter_key
```

### Option 2: Using the Koyeb Dashboard

1. Go to your [Koyeb Dashboard](https://app.koyeb.com/)
2. Click "Create App"
3. Select your Git provider and repository
4. Choose the `main` or `master` branch
5. In the "Environment Variables" section, add all the required variables listed above
6. Click "Deploy"

## Step 3: Configure Your Services

### MongoDB Atlas Setup

1. Create a new cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Add your IP to the whitelist (or allow access from anywhere for production)
4. Get your connection string and update the `MONGODB_URI` environment variable

### Redis Setup

1. Set up a Redis instance (Redis Cloud, AWS ElastiCache, etc.)
2. Get your host, port, and password
3. Update the `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` environment variables

### OpenRouter Setup

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from your account dashboard
3. Update the `OPENROUTER_API_KEY` environment variable

## Step 4: Post-Deployment Configuration

After deployment, you'll need to:

1. **Wait for the build to complete** - Check the deployment logs in the Koyeb dashboard
2. **Verify the health check** - Koyeb will automatically check `/health` endpoint
3. **Test the application** - Visit the provided URL

## Step 5: Setting Up the PDF Worker (Optional)

For production use, you may want to run the PDF processing worker separately:

1. Create a second service for the worker:
```yaml
services:
  - name: scholar-ai-worker
    type: worker
    build_type: npm
    build_command: npm install
    run_command: npm run worker
    env:
      # Same environment variables as the web service
</pre>

2. In Koyeb dashboard, create a separate worker service with the same environment variables but different run command

## Troubleshooting

### Common Issues:

1. **Application crashes during startup**
   - Check that all required environment variables are set
   - Verify MongoDB and Redis connection details

2. **Health check fails**
   - Ensure the `/health` endpoint is accessible
   - Check application logs for errors

3. **PDF processing fails**
   - Verify Redis connection
   - Check that the worker service is running (if deployed separately)

### Useful Commands:

- View application logs: `koyeb service logs scholar-ai`
- Update environment variables: `koyeb service update scholar-ai --env NEW_VAR=value`
- Scale your application: `koyeb service scale scholar-ai --instances 2`

## Scaling Recommendations

For production use:

1. **Scale horizontally**: Add more instances based on traffic
2. **Monitor resources**: Watch CPU and memory usage
3. **Set up alerts**: Configure notifications for deployment failures
4. **Use CDN**: Consider adding a CDN for static assets

## Security Best Practices

1. **Keep secrets secure**: Never hardcode credentials
2. **Use HTTPS**: Koyeb provides SSL certificates automatically
3. **Regular updates**: Keep dependencies up to date
4. **Monitor access**: Regularly review who has access to your services

## Updating Your Application

To deploy updates:

1. Push changes to your Git repository
2. Koyeb will automatically detect the changes and deploy a new version
3. Monitor the deployment in the dashboard

Or use the CLI:
```bash
koyeb deployment promote scholar-ai --deployment [DEPLOYMENT_ID]
```

Your Scholar.AI application should now be successfully deployed on Koyeb!