# Rahat Vendor App

React Native vendor application for the Rahat platform, built with Expo, Expo Router, TypeScript, NativeWind, React Query, and Zustand.

## Overview

This app is used by vendors to support beneficiary lookup, charging, transaction tracking, and settings management. The project follows Expo Router's file-based navigation and uses the design references in `../rahat-vendor-app-design-system/`.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router for navigation
- NativeWind and Tailwind CSS for styling
- TanStack Query for server-state management
- Zustand for local state
- Expo Google Fonts: Manrope, Roboto, and Inter

## Prerequisites

- Node.js 18 or newer
- npm or another compatible package manager
- Xcode Simulator for iOS development on macOS
- Android Studio emulator for Android development
- Expo Go or a local simulator/device

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm run start
```

Run on a target platform:

```bash
npm run ios
npm run android
npm run web
```

## Available Scripts

- `npm run start` starts the Expo dev server
- `npm run ios` opens the app in an iOS simulator
- `npm run android` opens the app in an Android emulator/device
- `npm run web` runs the app in the browser

## Project Structure

```text
app/
  app/
    _layout.tsx          # Root providers and stack registration
    index.tsx            # Initial landing route
    transactions.tsx     # Transactions screen
    (auth)/              # Authentication routes
    (tabs)/              # Main bottom-tab routes
    settings/            # Nested settings routes
  components/            # Reusable layout and UI components
  constants/             # Shared constants and token values
  hooks/                 # Custom hooks
  mocks/                 # Mock data
  services/              # Service layer
  stores/                # Zustand stores
  types/                 # Shared TypeScript types
  utils/                 # Utility helpers
```

## Navigation

The app uses Expo Router's file-based routing.

- `(auth)` contains login-related screens
- `(tabs)` contains the main app sections such as home, charge, beneficiaries, and settings
- `settings/` contains nested settings flows like profile, preferences, project selection, and token redemption
- The root layout wires global providers for React Query, safe areas, splash handling, fonts, and the main stack

## Styling and Design

- Global Tailwind layers are loaded from `global.css`
- NativeWind is used for utility-first styling in React Native components
- Typography is based on Manrope, Roboto, and Inter
- Design references, visual tokens, and UI kit screens are available in `../rahat-vendor-app-design-system/`

## Notes

- The Expo app scheme is `rahat-vendor`
- iOS bundle identifier: `io.rahat.vendor`
- Android package name: `io.rahat.vendor`
- The app is currently configured for light mode in `app.json`

## Related Files

- `app/app/_layout.tsx` for app-level providers and navigation setup
- `app/app.json` for Expo configuration
- `app/package.json` for scripts and dependencies
- `rahat-vendor-app-design-system/README.md` for design-system context
