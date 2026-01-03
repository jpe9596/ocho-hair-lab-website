#!/bin/bash

# Ocho Hair Lab Website - Quick Setup Script
# This script sets up the application for first-time use

set -e  # Exit on error

echo "🎨 Ocho Hair Lab Website - Quick Setup"
echo "======================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..
echo ""

# Initialize database
echo "🗄️  Initializing database..."
cd server
npm run init-db
cd ..
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your settings."
else
    echo "✅ .env file already exists"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env file with your Twilio credentials (optional for WhatsApp)"
echo "   2. Start the backend:  cd server && npm start"
echo "   3. In another terminal, start frontend: npm run dev"
echo "   4. Access the app at http://localhost:5173"
echo ""
echo "🔐 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change default passwords after first login!"
echo ""
echo "📚 For deployment to production server, see DEPLOYMENT.md"
