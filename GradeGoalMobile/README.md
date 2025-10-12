# GradeGoal Mobile App

A React Native mobile application for academic grade tracking and goal management, built with Expo and TypeScript.

## 🚀 Quick Start

### Prerequisites

Before running this app, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd GradeGoalMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env file with your configuration
   # Update API_BASE_URL to match your backend server
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

## 📱 Running on Devices

### Android

1. **Using Android Emulator**
   ```bash
   npm run android
   ```

2. **Using Physical Device**
   - Install Expo Go app from Play Store
   - Scan QR code from terminal/browser

### iOS

1. **Using iOS Simulator** (macOS only)
   ```bash
   npm run ios
   ```

2. **Using Physical Device**
   - Install Expo Go app from App Store
   - Scan QR code from terminal/browser

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
API_BASE_URL=http://localhost:8080/api
API_TIMEOUT=10000

# Development Settings
ENABLE_DEBUG_LOGS=true
ENABLE_NETWORK_LOGGING=true

# App Configuration
APP_VERSION=1.0.0
APP_ENVIRONMENT=development
```

### API Configuration

The app automatically detects the platform and uses appropriate API URLs:

- **Android Emulator**: `http://10.0.2.2:8080/api`
- **iOS Simulator**: `http://localhost:8080/api`
- **Physical Device**: Update `API_BASE_URL` in `.env` to your computer's IP address

### Backend Setup

Make sure your Spring Boot backend is running on port 8080. The mobile app expects the following endpoints:

- `POST /api/users/login`
- `POST /api/users/register`
- `GET /api/users/email/{email}`
- `GET /api/courses/user/id/{userId}`
- `GET /api/user-progress/{userId}/with-gpas`
- And more...

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   └── navigation/     # Navigation components
├── config/             # Configuration files
├── context/            # React Context providers
├── navigation/         # Navigation setup
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── services/           # API and business logic
├── styles/             # Styling and design tokens
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting

### Debugging

- **React Native Debugger**: Install and use for debugging
- **Flipper**: For advanced debugging and network inspection
- **Expo Dev Tools**: Built-in debugging tools

## 📦 Building for Production

### Android APK

```bash
# Build development APK
expo build:android

# Build production APK
expo build:android --type apk
```

### iOS IPA

```bash
# Build for iOS
expo build:ios
```

## 🚨 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Android build issues**
   - Make sure Android Studio and SDK are properly installed
   - Check `ANDROID_HOME` environment variable

3. **iOS build issues**
   - Make sure Xcode is installed (macOS only)
   - Check iOS simulator is available

4. **API connection issues**
   - Verify backend server is running
   - Check API_BASE_URL in .env file
   - For physical devices, use your computer's IP address

### Network Configuration

For physical devices, update the API URL to your computer's IP address:

```env
# Find your IP address
# Windows: ipconfig
# macOS/Linux: ifconfig

API_BASE_URL=http://192.168.1.100:8080/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

## 🔗 Related Projects

- **Backend**: Spring Boot API server
- **Web App**: React web application
- **Database**: MySQL database schema
