#!/bin/bash
# startup.sh - Script to start Scholar.AI application

echo "🚀 Starting Scholar.AI Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Redis is running
if ! nc -z localhost 6379; then
    echo "⚠️  Redis is not running. Please start Redis server:"
    echo "   On macOS: brew services start redis"
    echo "   On Linux: sudo systemctl start redis"
    echo "   Or use: docker-compose up redis"
fi

echo "✅ Dependencies installed successfully!"

echo ""
echo "📋 To start the application:"
echo "   Terminal 1: npm run dev  # Main server"
echo "   Terminal 2: npm run worker  # PDF processing worker"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📄 Open public/index.html in your browser for the frontend"