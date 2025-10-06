# Firebase Service Worker Setup

## Overview
The Firebase service worker (`firebase-messaging-sw.js`) contains sensitive API keys and configuration that should not be committed to version control.

## Setup Instructions

1. **Copy the template file:**
   ```bash
   cp public/firebase-messaging-sw.js.template public/firebase-messaging-sw.js
   ```

2. **Replace the configuration values:**
   Open `public/firebase-messaging-sw.js` and replace the following placeholders with your actual Firebase configuration:
   - `YOUR_API_KEY_HERE` → Your Firebase API key
   - `your-project.firebaseapp.com` → Your Firebase auth domain
   - `your-project-id` → Your Firebase project ID
   - `your-project.appspot.com` → Your Firebase storage bucket
   - `YOUR_SENDER_ID` → Your Firebase messaging sender ID
   - `YOUR_APP_ID` → Your Firebase app ID

3. **Get your Firebase configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → General → Your apps
   - Copy the configuration values from your web app

## Security Notes

- ✅ The template file (`firebase-messaging-sw.js.template`) is tracked in Git
- ✅ The actual file (`firebase-messaging-sw.js`) is ignored by Git
- ✅ Never commit the actual file with real API keys
- ✅ The `.gitignore` file ensures the sensitive file won't be accidentally committed

## File Structure

```
public/
├── firebase-messaging-sw.js.template  ← Template (tracked in Git)
└── firebase-messaging-sw.js           ← Actual file (ignored by Git)
```

## Troubleshooting

If you accidentally commit the file with real keys:
1. Remove it from Git history: `git rm --cached public/firebase-messaging-sw.js`
2. Commit the removal: `git commit -m "Remove sensitive Firebase config"`
3. Push to remote: `git push origin main`
4. Regenerate your Firebase API keys in the Firebase Console for security
