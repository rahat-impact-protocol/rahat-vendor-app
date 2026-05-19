# Google Sign-In → Wallet Generation → Register Flow

A compact implementation guide for the **Sign In with Google → Drive wallet check → Register** flow, based on how this app works. Use this to replicate the pattern in another app.

---

## What This Flow Does

```
User taps "Sign in with Google"
        ↓
Google OAuth popup (GIS)
  → get JWT ID token (who you are)
  → get Drive access token (to read/write files)
        ↓
Check Google Drive for existing wallet backup file
        ↓
[No backup found]          [Backup found]
Generate new wallet    →   Restore wallet from backup
Backup mnemonic            Skip to /select-organization
to Drive                            
        ↓
Navigate to /register
User fills name + phone
        ↓
POST /vendors (name, phone, wallet address, Google token)
        ↓
Challenge-response auth → get Bearer token
Navigate to home
```

---

## Key Files to Copy / Recreate

| File | What it does |
|---|---|
| `src/libs/sdk/services/google-identity.service.ts` | Core GIS singleton: loads scripts, One Tap, OAuth2 token client |
| `src/libs/sdk/constants/google-identity.ts` | Client IDs from env vars, `getGoogleClientId()` |
| `src/libs/sdk/constants/google-drive.ts` | Scopes, folder name, file name, discovery docs |
| `src/libs/sdk/utils/google/` | `GFile`, `GFolder`, `GDrive` — raw Drive API wrappers |
| `src/libs/general/hooks/use-google-identity.ts` | React hook: auth state, One Tap, sign-in/out |
| `src/libs/general/hooks/use-google-drive.ts` | React hook: Drive OAuth, backup/restore mutations |
| `src/libs/general/hooks/use-google-services.ts` | Combined hook — `auth` + `drive` in one |
| `src/libs/general/hooks/auth.ts` → `useGoogleLogin` | The main mutation that chains everything |
| `src/libs/sdk/utils/web3.ts` | `createRandomWallet()`, `getWalletUsingMnemonic()` |
| `src/libs/sdk/services/auth.ts` | `addVendor()`, `getChallenge()`, `getAuthToken()` |
| `src/sections/auth/registration/index.tsx` | Register form (name, phone) |
| `src/sections/landing-screen/index.tsx` | Landing page with "Sign in with Google" button |

---

## Step-by-Step Implementation

### Step 1 — Install Dependencies

```bash
pnpm add @codetrix-studio/capacitor-google-auth gapi-script
```

### Step 2 — Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=your-web-client.apps.googleusercontent.com
VITE_GOOGLE_ANDROID_CLIENT_ID=your-android-client.apps.googleusercontent.com
```

Declare in `vite-env.d.ts`:
```ts
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_ANDROID_CLIENT_ID?: string;
}
```

### Step 3 — Google Cloud Setup

1. Enable **Google Drive API** in Cloud Console
2. OAuth consent screen → add scopes: `profile`, `email`, `drive.file`
3. Create Web OAuth 2.0 client → add your domain to authorized origins
4. Create Android OAuth 2.0 client → add your SHA-1 + package name

### Step 4 — Constants

**`google-identity.ts`**
```ts
export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}
```

**`google-drive.ts`**
```ts
export const FOLDER_NAME = "YourApp Wallet";
export const FILE_NAME = "wallet-backup";
export const SCOPES = [
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.file",
];
export const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];
```

### Step 5 — The Core Hook: `useGoogleServices`

Copy `use-google-services.ts`, `use-google-identity.ts`, `use-google-drive.ts` from this repo. They depend only on the constants and service files above.

**Usage:**
```ts
const { auth, drive, signInAndAuthorize } = useGoogleServices({
  clientId: getGoogleClientId(),
  onAuthSuccess: (user) => setCurrentGoogleUser(user), // save to store
  onAuthError:   (err)  => showToast(err.message, 'danger'),
  autoInitialize: false, // initialize on demand
});
```

### Step 6 — The Main Login Mutation: `useGoogleLogin`

This is the core logic. It chains Google auth → Drive check → wallet create/restore.

```ts
export const useGoogleLogin = ({ createWallet, restoreWallet, setWallet,
  signInAndAuthorize, useBackupToGoogleDrive, useGetExistingBackup,
  useGetExistingBackupData }) => {

  return useMutation(async () => {
    // 1. Google sign-in + Drive OAuth in one step
    await signInAndAuthorize();

    // 2. Check if wallet backup already exists on Drive
    const existingBackup = await useGetExistingBackup.mutateAsync();

    if (!existingBackup) {
      // 3a. NEW USER: Generate wallet → backup to Drive
      const wallet = await createWallet.mutateAsync();
      const newFile = await useBackupToGoogleDrive.mutateAsync(wallet.mnemonic.phrase);
      setWallet(wallet);
      return { action: "create", wallet };
    } else {
      // 3b. EXISTING USER: Download mnemonic → restore wallet
      const mnemonic = await useGetExistingBackupData.mutateAsync(existingBackup.id);
      const wallet = await restoreWallet.mutateAsync(mnemonic);
      setWallet(wallet);
      return { action: "restore", wallet };
    }
  });
};
```

### Step 7 — Landing Page Button

```tsx
const { auth, drive, signInAndAuthorize } = useGoogleServices({ ... });
const googleLogin = useGoogleLogin({
  createWallet, restoreWallet, setWallet,
  signInAndAuthorize,
  useBackupToGoogleDrive: drive.backupToGoogleDrive,
  useGetExistingBackup:    drive.getExistingBackup,
  useGetExistingBackupData: drive.getExistingBackupData,
});

const handleGoogleLogin = async () => {
  const { action } = await googleLogin.mutateAsync();
  if (action === "create")  history.push("/register");       // show form
  if (action === "restore") history.push("/select-project"); // skip form
};
```

```tsx
<IonButton onClick={handleGoogleLogin}>Sign in with Google</IonButton>
```

### Step 8 — Register Form (for new users)

The form collects **name** and **phone**. On submit, build the payload and call your backend:

```ts
const onSubmit = async (data) => {
  const payload = {
    service: "WALLET",
    name: data.name,
    phone: data.fullPhone,
    wallet: wallet?.address,         // from Zustand store (set in step 6)
    googleIdToken: currentGoogleUser?.idToken, // from Zustand store (set in onAuthSuccess)
    extras: { isVendor: true },
  };
  await AuthService.addVendor(projectUrl, payload); // POST /vendors
};
```

> **Note:** `wallet.address` comes from the wallet generated in Step 6 and saved to your store via `setWallet()`. `currentGoogleUser.idToken` is the raw JWT set in `onAuthSuccess`. In this app's backend, auth uses wallet challenge-response — if your backend validates the Google token instead, pass `idToken` and skip the challenge step.

### Step 9 — Post-Register Auth (challenge-response)

After registration, get a Bearer token using wallet signature:

```ts
// In useGetAccessToken (auth.ts)
const challenge = await AuthService.getChallenge(projectUrl);     // POST /auth/challenge
const signature = await signMessage({ wallet, message: challenge });
const token     = await AuthService.getAuthToken(projectUrl, { challenge, signature }); // POST /auth/token
axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## Data Flow Summary

```
[Google OAuth] ──────────────────────────────────────────────────────────────────────────┐
  JWT credential  →  decodeJWT()  →  { sub, email, name, picture, idToken }             │
  Access token    →  stored in service  →  injected into gapi.client                    │
                                                                                         │
[Google Drive]                                                                           │
  gFolder.ensureExists("YourApp Wallet")  →  folder ID                                  │
  gFile.getByName("wallet-backup", folderId)  →  file or null                           │
    null  →  createRandomWallet()  →  mnemonic  →  gFile.createFile()                   │
    found →  gFile.downloadFile(fileId)  →  mnemonic  →  getWalletUsingMnemonic()       │
                                                                                         │
[Zustand Store]                                                                          │
  currentGoogleUser: { idToken, email, name, picture }  ←──────────────────────────────┘
  wallet:            { address, mnemonic }
                                                                                         
[Register Form]
  name + phone  →  POST /vendors  →  { name, phone, wallet: address, googleIdToken }
  
[Get Bearer Token]
  POST /auth/challenge  →  challenge string
  signMessage(wallet, challenge)  →  signature
  POST /auth/token  →  Bearer token
```

---

## What's in the Zustand Store After Sign-In

| Key | Value | Set by |
|---|---|---|
| `currentGoogleUser.idToken` | Raw JWT from Google | `onAuthSuccess` callback |
| `currentGoogleUser.email` | User email | `onAuthSuccess` callback |
| `currentGoogleUser.name` | User display name | `onAuthSuccess` callback |
| `wallet.address` | Ethereum wallet address | `setWallet()` in `useGoogleLogin` |
| `wallet.mnemonic.phrase` | 12-word mnemonic | `setWallet()` in `useGoogleLogin` |

---

## Common Gotchas

| Issue | Fix |
|---|---|
| One Tap doesn't show | `autoInitialize: false` — call `auth.initialize()` manually before `signIn()` |
| Drive auth must be user-initiated | Never call `requestAuthorization()` in `useEffect` — only inside a button click handler |
| `gapi.auth2` deprecated | This app uses GIS (`google.accounts.id` + `google.accounts.oauth2`) — do NOT use the old `gapi.auth2` |
| Android One Tap blocked | Use `@codetrix-studio/capacitor-google-auth` `GoogleAuth.signIn()` for native platforms — the hook handles this automatically via `isPlatform()` |
| "Not all scopes granted" | User clicked "Allow" but unchecked Drive scope — catch this error and prompt again |
| Wallet mnemonic security | Never log or display the mnemonic after registration. The app encrypts it with a passcode before storing locally. |
