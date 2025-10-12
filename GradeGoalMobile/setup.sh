#!/bin/bash

# ========================================
# GradeGoal Mobile App Setup Script
# ========================================

echo "🚀 Setting up GradeGoal Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install Expo CLI globally if not installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI is already installed"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update the API_BASE_URL with your backend server address."
else
    echo "✅ .env file already exists"
fi

# Check if Android Studio is installed (for Android development)
if command -v adb &> /dev/null; then
    echo "✅ Android development tools detected"
else
    echo "⚠️  Android development tools not detected. Install Android Studio for Android development."
fi

# Check if Xcode is installed (for iOS development, macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode detected (iOS development available)"
    else
        echo "⚠️  Xcode not detected. Install Xcode for iOS development."
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your backend server address"
echo "2. Start the development server: npm start"
echo "3. Run on device: npm run android (or npm run ios)"
echo ""
echo "For detailed instructions, see README.md"
