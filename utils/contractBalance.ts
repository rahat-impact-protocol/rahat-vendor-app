/**
 * On-chain beneficiary balance lookup for the CVA (Cash and Voucher Assistance) project.
 *
 * Contract architecture (confirmed from on-chain transactions on BaseSepolia):
 *
 *  DisbursementContract (settings: disbursementContract.address)
 *    └── beneficiaryAssignment[tokenAddress][_projectAddress][beneficiary] → uint256
 *
 *  The _projectAddress key stored in the mapping is fundStorageContract.address —
 *  verified by decoding the on-chain assignTokensToBeneficiaries calldata:
 *    _tokenAddress  = contract.token.address
 *    _projectAddress = contract.fundStorageContract.address   ← the key
 *    _beneficiaries = [beneficiaryWallet]
 *    _amounts       = [10000]
 *
 *  checkBeneficiaryBalance always reverts because vendorContract is not set
 *  on this deployment, so we read the public mapping directly.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { FUND_STORAGE_ABI, ERC20_ABI } from './abi';

const SETTINGS_KEY = 'rahat-app-settings';

interface BlockchainSetting {
  rpcUrl: string;
  chainId?: string;
}

interface ContractSetting {
  token: { address: string };
  fundStorageContract: { address: string };
  disbursementContract?: { address: string };
}

interface AppSettingEntry {
  id: string;
  name: string;
  value: unknown;
}

function findSetting<T>(settings: AppSettingEntry[], name: string): T | null {
  const entry = settings.find((s) => s.name === name);
  return entry ? (entry.value as T) : null;
}

/**
 * Returns the beneficiary's available token balance from the chain.
 *
 * @param beneficiaryAddress - The beneficiary's wallet address
 * @returns Token balance as a whole number (raw uint256 from the contract)
 */
export async function getBeneficiaryOnChainBalance(
  beneficiaryAddress: string,
): Promise<number> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) throw new Error('Blockchain settings not found in storage.');

  let settings: AppSettingEntry[];
  try {
    settings = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse settings from storage.');
  }

  const blockchain = findSetting<BlockchainSetting>(settings, 'blockchain');
  const contract   = findSetting<ContractSetting>(settings, 'contract');

  if (!blockchain?.rpcUrl)                       throw new Error('RPC URL not configured.');
  if (!contract?.token?.address)                 throw new Error('Token address not configured.');
  if (!contract?.fundStorageContract?.address)   throw new Error('FundStorage address not configured.');
  if (!contract?.disbursementContract?.address)  throw new Error('Disbursement contract address not configured.');

  const tokenAddress        = ethers.utils.getAddress(contract.token.address);
  // _projectAddress key used in assignTokensToBeneficiaries calls = fundStorageContract.address
  const projectKeyAddress   = ethers.utils.getAddress(contract.fundStorageContract.address);
  // The DisbursementContract holds the beneficiaryAssignment mapping
  const disbursementAddress = ethers.utils.getAddress(contract.disbursementContract.address);
  const beneficiary         = ethers.utils.getAddress(beneficiaryAddress);

  console.log('Balance lookup:', {
    disbursementContract: disbursementAddress,
    projectKey: projectKeyAddress,
    token: tokenAddress,
    beneficiary,
  });

  const provider        = new ethers.providers.JsonRpcProvider(blockchain.rpcUrl);
  const disbursement    = new ethers.Contract(disbursementAddress, FUND_STORAGE_ABI, provider);

  // ── Primary: beneficiaryAssignment public mapping ────────────────────────────
  // Direct storage read — no access control, returns 0 if not assigned.
  // Key order: beneficiaryAssignment[token][fundStorageAddress][beneficiary]
  try {
    const balance: ethers.BigNumber = await disbursement.beneficiaryAssignment(
      tokenAddress,
      projectKeyAddress,
      beneficiary,
    );
    console.log('disbursement.beneficiaryAssignment:', balance.toString());
    return balance.toNumber();
  } catch (err: any) {
    console.warn('beneficiaryAssignment failed:', err?.code ?? err?.message);
  }

  // ── Fallback: ERC20 balanceOf ────────────────────────────────────────────────
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: ethers.BigNumber = await tokenContract.balanceOf(beneficiary);
    let decimals = 18;
    try { decimals = await tokenContract.decimals(); } catch { /* keep 18 */ }
    const whole = Number(ethers.utils.formatUnits(balance, decimals));
    console.log('ERC20.balanceOf:', balance.toString(), '→', whole);
    return whole;
  } catch (err: any) {
    console.warn('ERC20.balanceOf failed:', err?.code ?? err?.message);
  }

  console.error('All balance sources exhausted for', beneficiary);
  return 0;
}
