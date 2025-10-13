# 🚀 Deployment Checklist

This checklist ensures your GradeGoal Mobile app is ready for cross-device deployment.

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed
- [ ] Code follows project conventions

### 2. Configuration
- [ ] Environment configuration is properly set up
- [ ] API URLs are configurable for different environments
- [ ] Sensitive data is not hardcoded
- [ ] `.env` file is properly configured

### 3. Dependencies
- [ ] All dependencies are up to date
- [ ] No security vulnerabilities in dependencies
- [ ] Package versions are locked in package-lock.json

### 4. Testing
- [ ] App runs successfully on Android emulator
- [ ] App runs successfully on iOS simulator (if available)
- [ ] App runs successfully on physical devices
- [ ] All major features are tested

### 5. Build Process
- [ ] App builds without errors
- [ ] No TypeScript compilation errors
- [ ] All assets are properly included

## 📱 Device-Specific Configuration

### Android
- [ ] Android Studio is installed
- [ ] Android SDK is properly configured
- [ ] Emulator or physical device is available
- [ ] API URL works with Android emulator (`http://10.0.2.2:8080/api`)

### iOS
- [ ] Xcode is installed (macOS only)
- [ ] iOS Simulator is available
- [ ] Physical iOS device is available (optional)
- [ ] API URL works with iOS simulator (`http://localhost:8080/api`)

### Physical Devices
- [ ] Backend server is accessible from device network
- [ ] API URL uses computer's IP address (e.g., `http://192.168.1.100:8080/api`)
- [ ] Firewall allows connections on port 8080

## 🌐 Network Configuration

### Development Environment
```env
API_BASE_URL=http://localhost:8080/api
ENABLE_DEBUG_LOGS=true
ENABLE_NETWORK_LOGGING=true
```

### Production Environment
```env
API_BASE_URL=https://your-production-api.com/api
ENABLE_DEBUG_LOGS=false
ENABLE_NETWORK_LOGGING=false
```

## 🔧 Setup Instructions for New Devices

### 1. Prerequisites Installation
**Required Software:**
- [ ] **Node.js** (v18 or higher) - Download from https://nodejs.org/
- [ ] **Expo CLI** - `npm install -g @expo/cli`
- [ ] **Android Studio** (for Android development)
- [ ] **Xcode** (for iOS development, macOS only)
- [ ] **Java JDK** (v17 or higher)

### 2. System Environment Variables Setup

#### Windows Setup:
**2.1 Open System Properties:**
```bash
# Method 1: Run command
sysdm.cpl

# Method 2: Windows key + R, type: sysdm.cpl
# Method 3: Control Panel > System > Advanced System Settings
```

**2.2 Set ANDROID_HOME:**
- Click "Environment Variables"
- Under "System Variables", click "New"
- Variable name: `ANDROID_HOME`
- Variable value: `C:\Users\[Username]\AppData\Local\Android\Sdk`
- Click "OK"

**2.3 Set JAVA_HOME:**
- Click "New" again
- Variable name: `JAVA_HOME`
- Variable value: `C:\Program Files\Java\jdk-17` (or your Java version)
- Click "OK"

**2.4 Update PATH:**
- Find "Path" in System Variables
- Click "Edit"
- Click "New" and add these paths:
  ```
  %ANDROID_HOME%\platform-tools
  %ANDROID_HOME%\tools
  %ANDROID_HOME%\tools\bin
  %JAVA_HOME%\bin
  ```

**2.5 Restart Command Prompt/PowerShell:**
```bash
# Close and reopen terminal
# Verify setup:
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
```

#### macOS Setup:
**2.1 Add to ~/.zshrc or ~/.bash_profile:**
```bash
# Open terminal and edit profile
nano ~/.zshrc

# Add these lines:
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$JAVA_HOME/bin

# Save and reload
source ~/.zshrc
```

#### Linux Setup:
**2.1 Add to ~/.bashrc:**
```bash
# Edit bashrc
nano ~/.bashrc

# Add these lines:
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$JAVA_HOME/bin

# Save and reload
source ~/.bashrc
```

**2.2 Verify Environment Variables:**
```bash
# Test Android setup
adb version

# Test Java setup
java -version
javac -version

# Test environment variables
echo $ANDROID_HOME  # Linux/macOS
echo $env:ANDROID_HOME  # Windows PowerShell
```

### 3. Clone Repository
```bash
git clone <your-repo-url>
cd GradeGoalMobile
```

### 4. Run Setup Script
```bash
# Linux/macOS
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

### 5. Manual Setup (if scripts fail)
```bash
# Install dependencies
npm install

# Install Expo CLI globally
npm install -g @expo/cli

# Create environment file
cp env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 6. Start Development Server
```bash
npm start
```

## 🚨 Common Issues and Solutions

### Issue: "Metro bundler failed to start"
**Solution:**
```bash
npx expo start --clear
```

### Issue: "Unable to connect to API"
**Solutions:**
1. Check if backend server is running
2. Verify API_BASE_URL in .env file
3. For physical devices, use computer's IP address
4. Check firewall settings

### Issue: "Android build failed"
**Solutions:**
1. Ensure Android Studio is installed
2. Check ANDROID_HOME environment variable
3. Update Android SDK
4. Clean and rebuild

### Issue: "iOS build failed"
**Solutions:**
1. Ensure Xcode is installed (macOS only)
2. Update Xcode to latest version
3. Check iOS Simulator is available
4. Clean and rebuild

### Issue: "adb: command not found"
**Solutions:**
1. Check ANDROID_HOME is set correctly
2. Verify PATH includes Android platform-tools
3. Restart terminal after setting environment variables
4. Find correct Android SDK path:
   ```bash
   # Windows
   dir C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   
   # macOS
   ls ~/Library/Android/sdk
   
   # Linux
   ls ~/Android/Sdk
   ```

### Issue: "Java not found" or "javac: command not found"
**Solutions:**
1. Check JAVA_HOME is set correctly
2. Verify PATH includes Java bin directory
3. Find correct Java installation path:
   ```bash
   # Windows
   dir "C:\Program Files\Java\"
   
   # macOS
   /usr/libexec/java_home -V
   
   # Linux
   update-alternatives --list java
   ```

### Issue: "Environment variables not working after restart"
**Solutions:**
1. **Windows**: Restart Command Prompt/PowerShell completely
2. **macOS/Linux**: Run `source ~/.zshrc` or `source ~/.bashrc`
3. Verify variables are set:
   ```bash
   # Windows PowerShell
   echo $env:ANDROID_HOME
   echo $env:JAVA_HOME
   
   # Linux/macOS
   echo $ANDROID_HOME
   echo $JAVA_HOME
   ```

## 📋 Testing Checklist

### Environment Setup Verification
- [ ] **Node.js** installed and working (`node --version`)
- [ ] **Expo CLI** installed globally (`expo --version`)
- [ ] **ANDROID_HOME** environment variable set correctly
- [ ] **JAVA_HOME** environment variable set correctly
- [ ] **PATH** includes Android and Java directories
- [ ] **adb** command works (`adb version`)
- [ ] **Java** command works (`java -version`)
- [ ] **javac** command works (`javac -version`)

### Functional Testing
- [ ] User can log in successfully
- [ ] Dashboard loads with real data
- [ ] Grade trends chart displays correctly
- [ ] Goals overview shows accurate data
- [ ] AI recommendations load properly
- [ ] Recent activities display correctly

### Performance Testing
- [ ] App loads within 3 seconds
- [ ] Smooth scrolling and navigation
- [ ] No memory leaks during extended use
- [ ] Efficient API calls

### Cross-Platform Testing
- [ ] Android emulator
- [ ] Android physical device
- [ ] iOS simulator (if available)
- [ ] iOS physical device (if available)

## 🔐 Security Considerations

- [ ] No sensitive data in code
- [ ] API keys are properly secured
- [ ] User authentication is working
- [ ] Data transmission is secure

## 📦 Build and Distribution

### Development Build
```bash
npm run build:android  # For Android
npm run build:ios      # For iOS
```

### Production Build
```bash
# Update app.json with production settings
# Build with production configuration
expo build:android --type apk
expo build:ios
```

## 📞 Support

If you encounter issues during deployment:

1. Check this checklist
2. Review the README.md
3. Check existing GitHub issues
4. Create a new issue with detailed information

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ App runs on all target devices
- ✅ All features work as expected
- ✅ Performance is acceptable
- ✅ No critical bugs or crashes
- ✅ Team members can easily set up and run the app

## 📚 Quick Reference: Environment Variables

### Windows (sysdm.cpl)
```
ANDROID_HOME = C:\Users\[Username]\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17
PATH += %ANDROID_HOME%\platform-tools
PATH += %ANDROID_HOME%\tools
PATH += %ANDROID_HOME%\tools\bin
PATH += %JAVA_HOME%\bin
```

### macOS/Linux (~/.zshrc or ~/.bashrc)
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$JAVA_HOME/bin
```

### Verification Commands
```bash
# Test environment variables
echo $ANDROID_HOME    # Linux/macOS
echo $env:ANDROID_HOME # Windows PowerShell

# Test tools
adb version
java -version
javac -version
```
