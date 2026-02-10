#!/bin/bash
# setup-env.sh - Script to set up environment variables for Koyeb deployment

echo "Setting up environment variables for Koyeb deployment..."

# Load existing .env file if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | xargs)
fi

# Prompt for required environment variables if not set
ENV_VARS=(
    "MONGODB_URI"
    "REDIS_HOST"
    "REDIS_PORT"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "OPENROUTER_API_KEY"
)

for var in "${ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Enter value for $var:"
        read -s value
        export $var="$value"
        echo
    else
        echo "$var is already set"
    fi
done

echo "Environment variables are set. You can now run the deployment script."
echo "To run the deployment, execute: ./deploy-koyeb.sh"