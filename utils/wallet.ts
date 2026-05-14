import { ethers } from 'ethers';

export interface GeneratedWallet {
  address: string;
  mnemonic: string;
  privateKey: string;
}

/**
 * Generates a new random Ethereum wallet.
 * Called once during vendor registration — store the mnemonic securely.
 */
export function generateWallet(): GeneratedWallet {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic.phrase,
    privateKey: wallet.privateKey,
  };
}
