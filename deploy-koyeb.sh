#!/bin/bash
# deploy-koyeb.sh - Deployment script for Scholar.AI on Koyeb

set -e  # Exit on any error

echo "🚀 Deploying Scholar.AI to Koyeb..."

# Check if koyeb CLI is installed
if ! command -v koyeb &> /dev/null; then
    echo "❌ Koyeb CLI is not installed."
    echo "Please install it first:"
    echo "  curl -sfL https://get.koyeb.com/ | sh"
    echo "  Or follow instructions at: https://github.com/koyeb/koyeb-cli"
    exit 1
fi

# Check if logged in to Koyeb
if ! koyeb auth status &> /dev/null; then
    echo "🔑 Please log in to Koyeb:"
    echo "  koyeb login"
    exit 1
fi

echo "📝 Checking environment variables..."
ENV_VARS=(
    "MONGODB_URI"
    "REDIS_HOST" 
    "REDIS_PORT"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "OPENROUTER_API_KEY"
)

MISSING_VARS=()
for var in "${ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these environment variables before deploying."
    echo "You can do this by:"
    echo "  export MONGODB_URI=your_value"
    echo "  export REDIS_HOST=your_value"
    echo "  ...and so on for all missing variables"
    exit 1
fi

echo "✅ All required environment variables are set."

APP_NAME="scholar-ai"
BRANCH="main"

echo "📦 Creating Koyeb app: $APP_NAME"

# Create the app if it doesn't exist
if ! koyeb app get $APP_NAME &> /dev/null; then
    koyeb app init $APP_NAME --type web
    echo "✅ Created app: $APP_NAME"
else
    echo "✅ App $APP_NAME already exists"
fi

echo "🚢 Deploying application..."

# Deploy with environment variables
koyeb deployment create $APP_NAME \
    --git . \
    --branch $BRANCH \
    --env MONGODB_URI="$MONGODB_URI" \
    --env REDIS_HOST="$REDIS_HOST" \
    --env REDIS_PORT="$REDIS_PORT" \
    --env REDIS_PASSWORD="$REDIS_PASSWORD" \
    --env JWT_SECRET="$JWT_SECRET" \
    --env JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
    --env OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
    --env NODE_ENV="production" \
    --env PORT="8080"

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📊 Monitor your deployment at: https://app.koyeb.com/apps/$APP_NAME"
echo ""
echo "🔗 Your application will be available at: https://$APP_NAME.YOUR_REGION.koyeb.app once deployed"
echo ""
echo "📖 For more information about managing your deployment, visit: https://koyeb.com/docs"