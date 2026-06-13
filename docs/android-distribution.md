# Android Distribution Guide (Bubblewrap TWA)

This guide explains how to build a native Android APK for CU Market that opens the PWA in fullscreen without the Chrome address bar.

## 1. Prerequisites
Ensure you have installed:
1. Java JDK 17 (or 11)
2. Android Studio (which installs the Android SDK Command-line Tools)
3. Node.js

## 2. Generate Keystore & Fingerprint (First Time Only)

To remove the Chrome browser bar, the app requires proof of ownership using a SHA-256 fingerprint.

1. Open your terminal in the project root (`g:\project\college marketplae`).
2. Run the initialization script to generate the configuration and keystore:
   ```bash
   npx @bubblewrap/cli init --manifest=https://cumarketplace.vercel.app/manifest.json
   ```
3. During setup, it will ask to generate a new keystore (`android.keystore`). Say **YES** and provide a password. Keep this password safe!
4. Once initialized, extract your SHA-256 fingerprint by running:
   ```bash
   keytool -list -v -keystore android.keystore -alias android
   ```
5. Copy the **SHA256** string from the output (e.g., `AA:BB:CC:DD...`).
6. Paste it into `public/.well-known/assetlinks.json` in this project.
7. Commit the change and push to Vercel so the fingerprint is live at `https://cumarketplace.vercel.app/.well-known/assetlinks.json`.

## 3. Build the APK

Once your `assetlinks.json` is live on Vercel:

1. Run the build command:
   ```bash
   npx @bubblewrap/cli build
   ```
2. This will prompt for your keystore password and generate `app-release-signed.apk`.
3. Rename the generated file to `cu-market-app.apk`.
4. Move `cu-market-app.apk` into the `public/` directory of your React project.
5. Commit and push to Vercel. 

Now, users can download the Android app directly from the "Download Android App" button on the homepage!

## 4. Updating the App
Because this is a TWA (Trusted Web Activity), **you do not need to rebuild the APK when you update the website.** The app essentially acts as a native fullscreen window to your Vercel deployment. Any updates to your React code will instantly appear in the installed Android app!
