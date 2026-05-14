// Google Drive constants — mirrors rahat-rp's constants/google-drive

/** Visible folder created in the user's Drive under "drive.file" scope */
export const FOLDER_NAME = 'Rahat';

/** Backup file stored inside the folder */
export const FILE_NAME = 'rahat-vendor-wallet.json';

/**
 * OAuth scopes requested during sign-in.
 * "drive.file" gives access only to files created by this app (user-visible folder).
 */
export const SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive.file',
];
