/**
 * Google Drive utilities - mirrors rahat-rp's GFile / GFolder / GDrive SDK classes.
 *
 * Uses the Drive REST API directly via fetch (gapi-script is browser-only and
 * cannot run in React Native / Expo).
 *
 * Requires scope: https://www.googleapis.com/auth/drive.file
 * Files are stored in a visible, named folder in the user's Drive (not appDataFolder).
 */

import { generateWallet, type GeneratedWallet } from './wallet';
import { FOLDER_NAME, FILE_NAME } from '@/constants/googleDrive';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export interface WalletCheckResult extends GeneratedWallet {
  isNew: boolean;
}

// -- GFolder ----------------------------------------------------------------

/**
 * Manages Drive folders - mirrors rahat-rp's GFolder class.
 */
export class GFolder {
  constructor(private token: string) {}

  /**
   * Return the folder if it exists, otherwise create it.
   * Equivalent to rahat-rp's gFolder.ensureExists(FOLDER_NAME).
   */
  async ensureExists(name: string): Promise<{ id: string; name: string }> {
    const params = new URLSearchParams({
      q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name)',
    });
    const res = await fetch(`${DRIVE_API}/files?${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any)?.error?.message ?? `Drive folder list failed: ${res.status}`);
    }
    const data = await res.json();
    if (data.files?.length > 0) return data.files[0];

    // Folder not found - create it
    const createRes = await fetch(`${DRIVE_API}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
    });
    if (!createRes.ok) {
      const body = await createRes.json().catch(() => ({}));
      throw new Error((body as any)?.error?.message ?? `Drive folder create failed: ${createRes.status}`);
    }
    return createRes.json();
  }
}

// -- GFile ------------------------------------------------------------------

/**
 * Manages Drive files - mirrors rahat-rp's GFile class.
 */
export class GFile {
  constructor(private token: string) {}

  /**
   * Check whether a file with the given name exists inside a folder.
   * Equivalent to rahat-rp's gFile.getByName(FILE_NAME, folder.id).
   */
  async getByName(
    name: string,
    folderId: string,
  ): Promise<{ exists: boolean; firstFile: { id: string; name: string } | null }> {
    const params = new URLSearchParams({
      q: `name='${name}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id,name)',
    });
    const res = await fetch(`${DRIVE_API}/files?${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any)?.error?.message ?? `Drive file list failed: ${res.status}`);
    }
    const data = await res.json();
    const files: Array<{ id: string; name: string }> = data.files ?? [];
    return { exists: files.length > 0, firstFile: files[0] ?? null };
  }

  /**
   * Create a new file with a multipart upload (metadata + content in one request).
   * Equivalent to rahat-rp's gFile.createFile({ name, data, parentId }).
   */
  async createFile({
    name,
    data,
    parentId,
  }: {
    name: string;
    data: unknown;
    parentId: string;
  }): Promise<{ id: string; name: string }> {
    const boundary = 'rahat_wallet_boundary';
    const metadata = JSON.stringify({ name, parents: [parentId] });
    const fileContent = typeof data === 'string' ? data : JSON.stringify(data);

    const body =
      `--${boundary}
` +
      `Content-Type: application/json; charset=UTF-8

` +
      `${metadata}
` +
      `--${boundary}
` +
      `Content-Type: application/json

` +
      `${fileContent}
` +
      `--${boundary}--`;

    const res = await fetch(
      `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error((errBody as any)?.error?.message ?? `Drive create failed: ${res.status}`);
    }
    return res.json();
  }

  /**
   * Update an existing file's content in-place.
   * Equivalent to rahat-rp's gFile.updateFile(fileId, data).
   * Prevents duplicate backup files being created on repeated backups.
   */
  async updateFile(fileId: string, data: unknown): Promise<{ id: string; name: string }> {
    const fileContent = typeof data === 'string' ? data : JSON.stringify(data);

    const res = await fetch(
      `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media&fields=id,name`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      },
    );
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error((errBody as any)?.error?.message ?? `Drive update failed: ${res.status}`);
    }
    return res.json();
  }

  /**
   * Download a file's content by its Drive file ID.
   * Equivalent to rahat-rp's gFile.downloadFile(fileId).
   */
  async downloadFile(fileId: string): Promise<unknown> {
    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) {
      throw new Error(`Drive download failed: ${res.status}`);
    }
    return res.json();
  }

  /**
   * List all files inside a folder.
   * Equivalent to rahat-rp's gFile.listFiles(folder.id).
   */
  async listFiles(folderId: string): Promise<Array<{ id: string; name: string }>> {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name)',
    });
    const res = await fetch(`${DRIVE_API}/files?${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any)?.error?.message ?? `Drive list failed: ${res.status}`);
    }
    const data = await res.json();
    return data.files ?? [];
  }
}

// -- GDrive -----------------------------------------------------------------

/**
 * Drive-level utilities - mirrors rahat-rp's GDrive class.
 */
export class GDrive {
  constructor(private token: string) {}

  /**
   * Returns true when the user's Drive storage is completely full.
   * Equivalent to rahat-rp's gDrive.checkDriveStorage().
   */
  async checkDriveStorage(): Promise<boolean> {
    const res = await fetch(`${DRIVE_API}/about?fields=storageQuota`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const quota = data.storageQuota;
    if (!quota?.limit) return false;
    const used = parseInt(quota.usage ?? '0', 10);
    const limit = parseInt(quota.limit, 10);
    return used >= limit;
  }
}

// -- Public helper ----------------------------------------------------------

/**
 * Check Google Drive for an existing wallet backup in the named Rahat folder.
 * - If found -> restore and return it with isNew: false.
 * - If not found -> generate a new wallet, back it up, return with isNew: true.
 */
export async function checkOrCreateWallet(
  accessToken: string,
): Promise<WalletCheckResult> {
  const gFolder = new GFolder(accessToken);
  const gFile = new GFile(accessToken);
  const gDrive = new GDrive(accessToken);

  const isFull = await gDrive.checkDriveStorage();
  if (isFull) throw new Error('Google Drive storage is full');

  const folder = await gFolder.ensureExists(FOLDER_NAME);
  const existing = await gFile.getByName(FILE_NAME, folder.id);

  if (existing.exists) {
    const walletData = await gFile.downloadFile(existing.firstFile!.id);
    return { ...(walletData as GeneratedWallet), isNew: false };
  }

  const newWallet = generateWallet();
  await gFile.createFile({ name: FILE_NAME, data: newWallet, parentId: folder.id });
  return { ...newWallet, isNew: true };
}
