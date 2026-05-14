// Google Drive constants — mirrors rahat-rp's constants/google-drive

/** Visible folder created in the user's Drive under "drive.file" scope */
export const FOLDER_NAME = 'Rahat';

/** Backup file stored inside the folder */
export const FILE_NAME = 'rahat-vendor-wallet.json';

/**
 * OAuth scopes requested during sign-in.
 * "drive" (full access) is required because:
 *  - /about?fields=storageQuota needs drive-level metadata (drive.file is insufficient)
 *  - files.list must find the Rahat folder across re-installs; drive.file only covers
 *    files created in the current OAuth session and returns 403 for pre-existing ones
 */
export const SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive',
];
