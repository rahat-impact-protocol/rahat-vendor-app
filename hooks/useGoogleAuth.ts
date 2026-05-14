/**
 * useGoogleAuth - mirrors rahat-rp's split useGoogleIdentity + useGoogleDrive hooks.
 *
 * Auth:  expo-auth-session (Expo equivalent of @codetrix-studio/capacitor-google-auth)
 * Drive: GFile / GFolder / GDrive classes via raw fetch (Expo equivalent of gapi-script)
 * Scope: drive.file  -> files stored in a visible, named "Rahat" folder (not appDataFolder)
 * Mutations: backupToGoogleDrive, getExistingBackup, getExistingBackupData, getWalletList
 *            (same shape as rahat-rp's useGoogle / useGoogleDrive hooks)
 */

import React from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useMutation } from '@tanstack/react-query';
import type { GoogleUser } from '@/types';
import { GFile, GFolder, GDrive } from '@/utils/googleDrive';
import { FOLDER_NAME, FILE_NAME, SCOPES } from '@/constants/googleDrive';

// Required so the OAuth redirect closes the browser and returns to the app
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthOptions {
  onSuccess: (user: GoogleUser) => void;
  onError?: (error: Error) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthOptions) {
  // ── Auth state (mirrors rahat-rp useGoogleIdentity) ──────────────
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: SCOPES,
    // Force Google to show the consent screen so a new token is issued with
    // the declared scopes (fixes 403 ACCESS_TOKEN_SCOPE_INSUFFICIENT when a
    // user's cached token was obtained under a narrower scope).
    prompt: 'consent',
  });

  // Handle OAuth response (mirrors rahat-rp handleCredentialResponse)
  React.useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) {
        fetchGoogleUser(token);
      } else {
        setLoading(false);
        const err = new Error('No access token received');
        setError(err.message);
        onError?.(err);
      }
    } else if (response?.type === 'error') {
      setLoading(false);
      const err = new Error(response.error?.message ?? 'Google sign-in failed');
      setError(err.message);
      onError?.(err);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const fetchGoogleUser = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch Google user info');
      const data = await res.json();
      const user: GoogleUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture,
        accessToken: token,
      };
      setAccessToken(token);
      setIsAuthenticated(true);
      setError(null);
      onSuccess(user);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch user info');
      setError(e.message);
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger the OAuth flow (mirrors rahat-rp signIn)
  // Must be synchronous so window.open() is called within the user-gesture context on web.
  // State updates before an `await` break the browser's popup-permission check.
  const signIn = () => {
    setLoading(true);
    setError(null);
    promptAsync(); // fire-and-forget; result handled by the useEffect above
  };

  // Clear auth state (mirrors rahat-rp signOut)
  const signOut = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // ── Drive mutations (mirrors rahat-rp useBackupToGoogleDrive etc.) ─

  /**
   * Back up any data to Google Drive.
   * Creates the file if it does not exist; updates it in-place if it does.
   * Mirrors rahat-rp's useBackupToGoogleDrive mutation.
   */
  const backupToGoogleDrive = useMutation({
    mutationFn: async (backupData: unknown) => {
      if (!accessToken) throw new Error('Not authorized. Sign in first.');

      const gFolder = new GFolder(accessToken);
      const gFile = new GFile(accessToken);
      const gDrive = new GDrive(accessToken);

      const isFull = await gDrive.checkDriveStorage();
      if (isFull) throw new Error('Google Drive storage is full');

      const folder = await gFolder.ensureExists(FOLDER_NAME);
      const existingFile = await gFile.getByName(FILE_NAME, folder.id);

      if (existingFile.exists) {
        // Update in-place (rahat-rp's gFile.updateFile)
        return gFile.updateFile(existingFile.firstFile!.id, backupData);
      }

      return gFile.createFile({ name: FILE_NAME, data: backupData, parentId: folder.id });
    },
  });

  /**
   * Get existing backup file metadata (id, name).
   * Mirrors rahat-rp's useGetExistingBackup mutation.
   */
  const getExistingBackup = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Not authorized. Sign in first.');

      const gFolder = new GFolder(accessToken);
      const gFile = new GFile(accessToken);
      const folder = await gFolder.ensureExists(FOLDER_NAME);
      const file = await gFile.getByName(FILE_NAME, folder.id);
      return file.exists ? file.firstFile : null;
    },
  });

  /**
   * Download backup file content by Drive file ID.
   * Mirrors rahat-rp's useGetExistingBackupData mutation.
   */
  const getExistingBackupData = useMutation({
    mutationFn: async (fileId: string) => {
      if (!accessToken) throw new Error('Not authorized. Sign in first.');
      return new GFile(accessToken).downloadFile(fileId);
    },
  });

  /**
   * List all files in the Rahat backup folder.
   * Mirrors rahat-rp's useGetWalletList mutation.
   */
  const getWalletList = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Not authorized. Sign in first.');
      const gFolder = new GFolder(accessToken);
      const gFile = new GFile(accessToken);
      const folder = await gFolder.ensureExists(FOLDER_NAME);
      return gFile.listFiles(folder.id);
    },
  });

  return {
    // Auth (mirrors rahat-rp useGoogleIdentity)
    signIn,
    signOut,
    loading,
    requestReady: !!request,
    isAuthenticated,
    accessToken,
    error,

    // Drive mutations (mirrors rahat-rp useGoogleDrive / useGoogle)
    backupToGoogleDrive,
    getExistingBackup,
    getExistingBackupData,
    getWalletList,
  };
}
