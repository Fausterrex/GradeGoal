@echo off
REM ========================================
REM GradeGoal Mobile App Setup Script (Windows)
REM ========================================

echo 🚀 Setting up GradeGoal Mobile App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Install Expo CLI globally if not installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Expo CLI...
    npm install -g @expo/cli
) else (
    echo ✅ Expo CLI is already installed
)

REM Install dependencies
echo 📦 Installing project dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please update the API_BASE_URL with your backend server address.
) else (
    echo ✅ .env file already exists
)

REM Check if Android Studio is installed
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Android development tools not detected. Install Android Studio for Android development.
) else (
    echo ✅ Android development tools detected
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your backend server address
echo 2. Start the development server: npm start
echo 3. Run on device: npm run android
echo.
echo For detailed instructions, see README.md
pause
