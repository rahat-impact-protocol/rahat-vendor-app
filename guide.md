# Sign In with Google — Frontend Implementation Guide

This guide documents the full frontend architecture and workflow for **Google Sign-In + Google Drive backup** in the Rahat RP Vendor App (Ionic + React + Capacitor).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Environment & Configuration](#3-environment--configuration)
4. [Library Setup](#4-library-setup)
5. [Layer-by-Layer Walkthrough](#5-layer-by-layer-walkthrough)
   - [5.1 Service Layer — `GoogleIdentityService`](#51-service-layer--googleidentityservice)
   - [5.2 Utility Layer — `GFile`, `GFolder`, `GDrive`](#52-utility-layer--gfile-gfolder-gdrive)
   - [5.3 Hook Layer — `useGoogleIdentity`](#53-hook-layer--usegoogleidentity)
   - [5.4 Hook Layer — `useGoogleDrive`](#54-hook-layer--usegoogledrive)
   - [5.5 Combined Hook — `useGoogleServices`](#55-combined-hook--usegoogleservices)
6. [Full Sign-In Workflow](#6-full-sign-in-workflow)
7. [UI Components](#7-ui-components)
8. [Pages & Routing](#8-pages--routing)
9. [Backup Section (`GoogleBackup`)](#9-backup-section-googlebackup)
10. [Restore Wallet from Google Drive](#10-restore-wallet-from-google-drive)
11. [Platform Differences — Web vs Native](#11-platform-differences--web-vs-native)
12. [State Management](#12-state-management)
13. [Recreating This Feature Step by Step](#13-recreating-this-feature-step-by-step)

---

## 1. Architecture Overview

The app uses **Google Identity Services (GIS) v2** — the modern OAuth 2.0 replacement for the deprecated `gapi.auth2`. The architecture separates two distinct concerns:

| Concern | API Used | Purpose |
|---|---|---|
| **Authentication** | `google.accounts.id` (GIS) | Verify user identity via JWT ID token (One Tap / Sign In button) |
| **Authorization** | `google.accounts.oauth2` (GIS) | Obtain OAuth access token to call Google Drive API |
| **Drive API calls** | `gapi.client.drive` | Upload/download wallet backup files |

> **Key principle**: Authentication (who you are) and Authorization (what you can do) are **separate steps**. The user authenticates first, and then a separate user gesture grants Drive access.

### Why GIS instead of `gapi.auth2`?

`gapi.auth2` was deprecated by Google in 2023. The new `google.accounts.id` / `google.accounts.oauth2` libraries are the required replacement. See [docs/google-identity-migration.md](./google-identity-migration.md) for migration notes.

---

## 2. Folder Structure

```
src/
├── vite-env.d.ts                        # Env variable type declarations
├── config.ts                            # App-level constants (APP_NAME, etc.)
│
├── libs/
│   ├── sdk/
│   │   ├── constants/
│   │   │   ├── google-drive.ts          # Drive scopes, folder/file names, discovery docs
│   │   │   └── google-identity.ts       # Client IDs per platform, helper getGoogleClientId()
│   │   │
│   │   ├── services/
│   │   │   └── google-identity.service.ts  # Core service class: GIS load, auth, OAuth, token management
│   │   │
│   │   └── utils/
│   │       └── google/
│   │           ├── index.js             # Re-exports GFile, GFolder, GDrive
│   │           ├── gfile.js             # Drive file operations (create, get, list, download)
│   │           ├── gfolder.js           # Drive folder operations (create, get, ensureExists)
│   │           └── gdrive.ts            # Drive storage quota check
│   │
│   └── hooks/
│           ├── use-google-identity.ts   # React hook wrapping authentication flow
│           ├── use-google-drive.ts      # React hook wrapping Drive authorization + operations
│           ├── use-google-services.ts   # Combined hook (auth + drive in one)
│           └── use-google.ts            # (Legacy) hook using old GoogleAuth + gapi.auth2 pattern
│
├── components/
│   └── google/
│       ├── googleAccount.tsx            # UI component: user avatar, name, email, switch/continue buttons
│       └── googleAccount.scss           # Styles for googleAccount component
│
├── pages/
│   ├── google-backup.tsx                # Page wrapper for Google Drive backup
│   └── restore-google.tsx              # Page wrapper for restore from Google Drive
│
├── sections/
│   └── settings/
│       └── backup/
│           └── index.tsx                # Backup section: full sign-in → authorize → backup flow
│
└── navigations/
    ├── router.tsx                       # Declares /restore-google route
    └── tabrouter.tsx                    # Declares /tabs/settings/backup/google route

capacitor.config.ts                      # Capacitor GoogleAuth plugin config (scopes, client IDs)
```

---

## 3. Environment & Configuration

### `.env` variables

```env
VITE_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
VITE_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
VITE_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### `src/vite-env.d.ts`

Declares the environment variables for TypeScript:

```ts
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_ANDROID_CLIENT_ID?: string;
  readonly VITE_GOOGLE_IOS_CLIENT_ID?: string;
}
```

### `src/libs/sdk/constants/google-identity.ts`

```ts
import { APP_NAME } from "@config";

export const GOOGLE_CLIENT_IDS = {
  web:     import.meta.env.VITE_GOOGLE_CLIENT_ID,
  android: import.meta.env.VITE_GOOGLE_ANDROID_CLIENT_ID,
  ios:     import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID,
};

export function getGoogleClientId(): string {
  return GOOGLE_CLIENT_IDS.web;
}

export const FOLDER_NAME = "Rumsan Wallet";
export const FILE_NAME = APP_NAME || "default";
export const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
export const SCOPES = [
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.file",
];
export const GIS_LIBRARY_URL = "https://accounts.google.com/gsi/client";
export const GAPI_LIBRARY_URL = "https://apis.googleapis.com/js/api.js";
```

### `capacitor.config.ts` — Native plugin config

```ts
plugins: {
  GoogleAuth: {
    scopes: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
    serverClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    forceCodeForRefreshToken: true,
  },
}
```

---

## 4. Library Setup

### Install packages

```bash
pnpm add @codetrix-studio/capacitor-google-auth gapi-script
```

- `@codetrix-studio/capacitor-google-auth` — Native Capacitor plugin for Android/iOS sign-in
- `gapi-script` — Bundled Google API client (`gapi`) for Drive API calls

### How GIS library is loaded

The GIS script (`https://accounts.google.com/gsi/client`) is **dynamically injected** into `<head>` by `GoogleIdentityService.loadGISLibrary()` — no static `<script>` tag required in `index.html`.

`gapi` is loaded via the `gapi-script` npm package, **not** a dynamic script injection, to stay compatible with the Vite/bundler toolchain.

---

## 5. Layer-by-Layer Walkthrough

### 5.1 Service Layer — `GoogleIdentityService`

**File:** `src/libs/sdk/services/google-identity.service.ts`

The central singleton service class. All raw Google API calls go here.

```
GoogleIdentityService
├── loadGISLibrary()          → Injects accounts.google.com/gsi/client <script>
├── loadGAPILibrary()         → Loads gapi 'client' module via gapi.load()
├── initialize()              → Loads GIS library (call once on startup)
├── initializeGAPI()          → Lazily initializes gapi.client (only for Drive ops)
├── initializeAuth(callback)  → Calls google.accounts.id.initialize() with JWT callback
├── renderButton(element)     → Renders standard "Sign in with Google" button
├── showOneTap(listener)      → Shows Google One Tap prompt
├── decodeJWT(token)          → Base64-decodes JWT to get GoogleUserProfile
├── setIdToken(token)         → Stores the ID token
├── initializeTokenClient()   → Sets up google.accounts.oauth2 token client for Drive
├── requestAccessToken()      → Triggers OAuth consent popup (must be user-initiated)
├── hasGrantedAllScopes()     → Validates that all requested scopes were granted
├── revokeAccessToken()       → Revokes the OAuth access token
├── disableAutoSelect()       → Prevents One Tap from auto-selecting an account
└── getAccessToken()          → Returns the current stored access token
```

A singleton factory ensures one service instance per client ID:

```ts
const instances = new Map<string, GoogleIdentityService>();

export function getGoogleIdentityService(clientId: string): GoogleIdentityService {
  if (!instances.has(clientId)) {
    instances.set(clientId, new GoogleIdentityService(clientId));
  }
  return instances.get(clientId)!;
}
```

### 5.2 Utility Layer — `GFile`, `GFolder`, `GDrive`

**File:** `src/libs/sdk/utils/google/`

Low-level wrappers over `gapi.client.drive.*`. These are plain classes (not React hooks) that must receive the initialized `gapi` object.

| Class | Methods | Purpose |
|---|---|---|
| `GFolder` | `create()`, `getByName()`, `ensureExists()` | Manage the backup folder in Drive |
| `GFile` | `createFile()`, `getByName()`, `listFiles()`, `downloadFile()` | Upload/download wallet backup files |
| `GDrive` | `checkDriveStorage()` | Check if user's Drive quota is full |

Usage pattern:

```ts
const gFolder = new GFolder(gapi);
const gFile   = new GFile(gapi);
const gDrive  = new GDrive(gapi);

// Ensure the backup folder exists (creates if not found)
const folder = await gFolder.ensureExists("Rumsan Wallet");

// Check for an existing backup file
const file = await gFile.getByName("wallet-backup", folder.id);

// Create/upload the backup
const newFile = await gFile.createFile({ name: "wallet-backup", data: mnemonic, parentId: folder.id });
```

### 5.3 Hook Layer — `useGoogleIdentity`

**File:** `src/libs/hooks/use-google-identity.ts`

React hook that manages **authentication state** using `GoogleIdentityService`.

```ts
const {
  isInitialized,    // Whether GIS library is ready
  isLoading,        // Loading state during initialize()
  isAuthenticated,  // Whether user is signed in
  user,             // CurrentGoogleUser (name, email, picture, idToken, sub)
  error,
  initialize,       // Loads GIS and sets up JWT callback
  signIn,           // Triggers One Tap (web) or GoogleAuth.signIn() (native)
  signOut,          // Clears tokens and signs out
  renderButton,     // Renders GIS sign-in button into a DOM element
  showOneTap,       // Shows One Tap prompt manually
} = useGoogleIdentity({ clientId, onSuccess, onError, autoInitialize });
```

**Platform branching in `signIn()`:**

```
isPlatform("mobileweb") || isPlatform("desktop")
  → true  (web/PWA): show One Tap prompt via google.accounts.id.prompt()
  → false (native):  call @codetrix-studio/capacitor-google-auth GoogleAuth.signIn()
```

When the user signs in, the JWT credential is decoded to extract `GoogleUserProfile`. The `onSuccess` callback receives a `CurrentGoogleUser` object.

### 5.4 Hook Layer — `useGoogleDrive`

**File:** `src/libs/hooks/use-google-drive.ts`

React hook that manages **Drive authorization state and mutations**.

```ts
const {
  isAuthorized,           // Whether Drive access token is present
  isLoading,
  error,
  accessToken,
  requestAuthorization,   // Triggers OAuth consent popup (MUST be user gesture)
  revokeAuthorization,    // Revokes the access token
  authorizeAsync,         // Promise-based wrapper around requestAuthorization
  backupToGoogleDrive,    // useMutation: uploads mnemonic phrase to Drive
  getExistingBackup,      // useMutation: finds an existing backup file in Drive
  getExistingBackupData,  // useMutation: downloads file content by file ID
  getWalletList,          // useMutation: lists all wallet files in backup folder
} = useGoogleDrive({ clientId, isAuthenticated, onSuccess, onError });
```

**Flow inside `backupToGoogleDrive` mutation:**

```
1. Check isAuthorized (throws if not)
2. ensureGAPI() — initialize gapi.client and inject access token
3. gDrive.checkDriveStorage() — throw if full
4. gFolder.ensureExists(FOLDER_NAME) — create folder if missing
5. gFile.createFile({ name, data: mnemonic, parentId: folder.id })
6. Return new file object { id, name, ... }
```

### 5.5 Combined Hook — `useGoogleServices`

**File:** `src/libs/hooks/use-google-services.ts`

Convenience wrapper that composes `useGoogleIdentity` + `useGoogleDrive` into one hook.

```ts
const { auth, drive, signInAndAuthorize, signOutAndRevoke } = useGoogleServices({
  clientId: getGoogleClientId(),
  onAuthSuccess: (user) => { /* user authenticated */ },
  onAuthError:   (err)  => { /* handle error */ },
  onDriveSuccess: (token) => { /* drive authorized */ },
  onDriveError:   (err)  => { /* handle error */ },
});

// auth.signIn()               → triggers sign-in
// auth.showOneTap()           → shows One Tap
// auth.signOut()              → clears auth state
// drive.requestAuthorization()  → requests Drive access
// drive.backupToGoogleDrive.mutateAsync(mnemonic)
// drive.getExistingBackup.mutateAsync()
```

---

## 6. Full Sign-In Workflow

```
User taps "Backup to Google Drive"
         │
         ▼
[GoogleBackup section]
handleBackupGoogle()
  → setIsAuthenticating(true)
  → auth.showOneTap()                  ← triggers google.accounts.id.prompt()
         │
         ▼
Google One Tap UI appears
User selects account
         │
         ▼
handleCredentialResponse(response)     ← GIS calls this with JWT credential
  → service.decodeJWT(response.credential)
  → setUser(currentUser)
  → setIsAuthenticated(true)
  → onAuthSuccess(user)  ─────────────────────────────────────────────────────┐
                                                                               │
         ┌─────────────────────────────────────────────────────────────────────┘
         ▼
onAuthSuccess callback in GoogleBackup
  → setIsAuthenticating(false)
  → setIsAuthorizing(true)
  → changeAction("#choose-account")    ← show account confirmation UI
         │
         ▼
User sees GoogleAccount component
(avatar + name + email + "Continue" button)
         │
User taps "Continue with this account"
         ▼
handleContinueWithSelectedAccount()
  → drive.requestAuthorization()       ← calls google.accounts.oauth2 token client
         │                                MUST be a direct user gesture
         ▼
Google OAuth consent screen appears
User grants Drive permission
         │
         ▼
handleTokenResponse(response)          ← token client callback
  → service.hasGrantedAllScopes(...)   ← validates all scopes granted
  → setAccessToken(response.access_token)
  → gapi.client.setToken(...)
  → setIsAuthorized(true)
  → onDriveSuccess(token)  ────────────────────────────────────────────────────┐
                                                                               │
         ┌─────────────────────────────────────────────────────────────────────┘
         ▼
onDriveSuccess callback in GoogleBackup
  → setIsAuthorizing(false)
  → handleBackupAfterAuth()
         │
         ▼
backupWallet()
  → drive.getExistingBackup.mutateAsync()   ← check if backup already exists
         │
         ├── exists → setGoogleDriveBackupStatus(address, true, existingBackup.id)
         │            changeAction("#success")
         │
         └── not exists
               → drive.backupToGoogleDrive.mutateAsync(wallet.mnemonic.phrase)
               → setGoogleDriveBackupStatus(address, true, newFile.id)
               → changeAction("#success")
```

---

## 7. UI Components

### `GoogleAccount` component

**File:** `src/components/google/googleAccount.tsx`

Displays the authenticated user's Google profile with action buttons.

```tsx
<GoogleAccount
  currentGoogleUser={auth.user}          // GoogleUserProfile | null
  handleSwitchAccount={handleSwitchAccount}
  handleContinue={handleContinueWithSelectedAccount}
  continueBtnText="Continue with this account"
/>
```

**Renders:**
- `IonAvatar` with `currentGoogleUser.picture` (falls back to default image)
- User `name` and `email`
- "Switch Account" button (only if `currentGoogleUser.sub` is present)
- "Continue" button (only if `currentGoogleUser.sub` is present)

---

## 8. Pages & Routing

### Route declarations

**`src/navigations/router.tsx`** (public/unauthenticated routes):
```tsx
<Route exact path="/restore-google" component={RestoreGooglePage} />
```

**`src/navigations/tabrouter.tsx`** (authenticated tab routes):
```tsx
<Route exact path="/tabs/settings/backup/google" component={GoogleBackupPage} />
```

### Page components

**`src/pages/google-backup.tsx`** — Wraps `<GoogleBackup />` section inside `IonPage` + `IonContent` layout.

**`src/pages/restore-google.tsx`** — Wraps `<RestoreGoogle />` section for wallet restore flow.

---

## 9. Backup Section (`GoogleBackup`)

**File:** `src/sections/settings/backup/index.tsx`

This section drives the multi-step backup flow using URL hash changes as action states:

| Hash | Step | Description |
|---|---|---|
| `#backup-method` | 1 | Select backup method (default landing) |
| `#choose-account` | 2 | Confirm Google account (show `GoogleAccount` component) |
| `#process` | 3 | "Backup in progress" loading state |
| `#success` | 4 | Backup complete — show success + home button |

**Key state variables:**

```ts
const [isAuthenticating, setIsAuthenticating] = useState(false); // One Tap in progress
const [isAuthorizing, setIsAuthorizing]       = useState(false); // Drive consent in progress
const [isWalletBackedUp, setIsWalletBackedUp] = useState(false); // Local backup status
const [currentAction, setCurrentAction]       = useState({});    // Current step
```

**Key handlers:**

| Handler | Action |
|---|---|
| `handleBackupGoogle()` | Shows One Tap prompt to start authentication |
| `handleContinueWithSelectedAccount()` | Requests Drive authorization |
| `handleSwitchAccount()` | Signs out and shows One Tap again |
| `backupWallet()` | Calls Drive mutations to check existing / upload new backup |

---

## 10. Restore Wallet from Google Drive

The restore flow mirrors backup in reverse:

1. User navigates to `/restore-google`
2. `useGoogleServices` is initialized with the web client ID
3. User authenticates via One Tap / sign-in button
4. `drive.requestAuthorization()` is triggered
5. `drive.getExistingBackup.mutateAsync()` finds the backup file
6. `drive.getExistingBackupData.mutateAsync(fileId)` downloads the mnemonic
7. Wallet is restored from the mnemonic using `getWalletUsingMnemonic(mnemonic)`

---

## 11. Platform Differences — Web vs Native

| | Web / PWA (`isPlatformWeb = true`) | Native Android/iOS (`isPlatformWeb = false`) |
|---|---|---|
| **Sign-in method** | `google.accounts.id.prompt()` (One Tap) | `GoogleAuth.signIn()` from `@codetrix-studio/capacitor-google-auth` |
| **Token source** | JWT ID token decoded from `CredentialResponse.credential` | `googleUser.authentication.accessToken` from Capacitor plugin |
| **Drive auth** | `google.accounts.oauth2.initTokenClient()` | Same — GIS OAuth2 flow |
| **Client ID used** | `VITE_GOOGLE_CLIENT_ID` (web) | `androidClientId` / `iosClientId` from `capacitor.config.ts` |
| **Sign-out** | `google.accounts.id.disableAutoSelect()` | + `GoogleAuth.signOut()` |

```ts
// Platform detection
const isPlatformWeb = isPlatform("mobileweb") || isPlatform("desktop");
```

---

## 12. State Management

Google auth state is stored in the **Zustand app store** (`useAppStore`):

```ts
// Relevant slices
currentGoogleUser: CurrentGoogleUser | null  // Set after successful sign-in
wallet: Wallet | null                        // Set after wallet creation/restore
```

Google Drive backup status is stored in the **offline store** (`useOfflineStore`):

```ts
setGoogleDriveBackupStatus(walletAddress, isBackedUp, fileId)
getGoogleDriveBackupStatus(walletAddress) → { isBackedUp: boolean, fileId: string }
```

---

## 13. Recreating This Feature Step by Step

### Step 1 — Google Cloud Console

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the **Google Drive API**
3. Configure **OAuth consent screen** (add scopes: `profile`, `email`, `drive.file`)
4. Create OAuth 2.0 credentials:
   - **Web client** → add your domain to "Authorized JavaScript origins" and "Authorized redirect URIs"
   - **Android client** → add your SHA-1 certificate fingerprint and package name
   - **iOS client** → add your bundle ID

### Step 2 — Install packages

```bash
pnpm add @codetrix-studio/capacitor-google-auth gapi-script
```

### Step 3 — Set environment variables

```env
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Step 4 — Create constants files

Create `src/libs/sdk/constants/google-drive.ts`:
```ts
export const FOLDER_NAME = "YourApp Wallet";
export const FILE_NAME = "wallet-backup";
export const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
export const SCOPES = [
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.file",
];
```

Create `src/libs/sdk/constants/google-identity.ts`:
```ts
export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}
```

### Step 5 — Create the service class

Create `src/libs/sdk/services/google-identity.service.ts` with `GoogleIdentityService`:
- `loadGISLibrary()` — dynamically injects the GIS `<script>`
- `loadGAPILibrary()` — loads `gapi.client` via `gapi-script`
- `initialize()` — entry point: loads GIS library
- `initializeAuth(callback)` — sets up `google.accounts.id`
- `showOneTap()` — shows One Tap prompt
- `initializeTokenClient(callback, scopes)` — sets up OAuth2 token client
- `requestAccessToken()` — triggers Drive consent (must be user-initiated)
- `decodeJWT(token)` — parses JWT ID token

### Step 6 — Create Drive utility classes

Create `src/libs/sdk/utils/google/`:
- `gfolder.js` — `GFolder` class with `ensureExists(name)`
- `gfile.js` — `GFile` class with `createFile()`, `getByName()`, `downloadFile()`
- `gdrive.ts` — `GDrive` class with `checkDriveStorage()`
- `index.js` — re-exports all three

### Step 7 — Create React hooks

1. **`use-google-identity.ts`** — wraps service auth methods into React state
2. **`use-google-drive.ts`** — wraps service OAuth + Drive mutations into React state
3. **`use-google-services.ts`** — composes both into a single hook

### Step 8 — Create the `GoogleAccount` UI component

Create `src/components/google/googleAccount.tsx`:
- Displays user avatar, name, email
- "Switch Account" and "Continue" buttons

### Step 9 — Create the Backup section

Create `src/sections/settings/backup/index.tsx`:
- Call `useGoogleServices({ clientId, onAuthSuccess, onDriveSuccess })`
- Implement hash-based step navigation (`#backup-method` → `#choose-account` → `#process` → `#success`)
- `handleBackupGoogle()` → `auth.showOneTap()`
- `onAuthSuccess` → `changeAction("#choose-account")`
- `handleContinueWithSelectedAccount()` → `drive.requestAuthorization()`
- `onDriveSuccess` → `backupWallet()`

### Step 10 — Create pages and register routes

```tsx
// pages/google-backup.tsx
const GoogleBackupPage: FC = () => (
  <IonPage>
    <IonContent><GoogleBackup /></IonContent>
  </IonPage>
);

// In tabrouter.tsx
<Route path="/tabs/settings/backup/google" component={GoogleBackupPage} />
```

### Step 11 — Configure Capacitor (native only)

Update `capacitor.config.ts` with `GoogleAuth` plugin config and run:

```bash
npx cap sync
```

---

## Quick Reference — Key Files

| File | Role |
|---|---|
| `src/libs/sdk/services/google-identity.service.ts` | Core singleton service — all raw GIS/OAuth calls |
| `src/libs/sdk/constants/google-identity.ts` | Client IDs, `getGoogleClientId()` |
| `src/libs/sdk/constants/google-drive.ts` | Scopes, folder name, discovery docs |
| `src/libs/sdk/utils/google/gfile.js` | Drive file CRUD |
| `src/libs/sdk/utils/google/gfolder.js` | Drive folder CRUD |
| `src/libs/sdk/utils/google/gdrive.ts` | Drive storage check |
| `src/libs/hooks/use-google-identity.ts` | React auth state hook |
| `src/libs/hooks/use-google-drive.ts` | React Drive auth + mutations hook |
| `src/libs/hooks/use-google-services.ts` | Combined hook (recommended usage) |
| `src/components/google/googleAccount.tsx` | Signed-in user profile UI |
| `src/sections/settings/backup/index.tsx` | Full backup flow orchestration |
| `src/pages/google-backup.tsx` | Page wrapper for backup |
| `src/pages/restore-google.tsx` | Page wrapper for restore |
| `capacitor.config.ts` | Native plugin OAuth config |
