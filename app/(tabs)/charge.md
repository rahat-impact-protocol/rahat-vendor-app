# Frontend Guide: Get Beneficiary Balance On-Chain using ethers.js


---

## Table of Contents

1. [What problem are we solving?](#1-what-problem-are-we-solving)
2. [Understanding the localStorage settings](#2-understanding-the-localstorage-settings)
3. [Understanding the ABI (full explanation)](#3-understanding-the-abi-full-explanation)
4. [What is ethers.js and why do we use it?](#4-what-is-ethersjs-and-why-do-we-use-it)
5. [Install ethers.js](#5-install-ethersjs)
6. [Step-by-step implementation](#6-step-by-step-implementation)
   - 6.1 [Create the ABI file](#61-create-the-abi-file)
   - 6.2 [Create the settings loader](#62-create-the-settings-loader)
   - 6.3 [Create the provider](#63-create-the-provider)
   - 6.4 [Create the contract instance](#64-create-the-contract-instance)
   - 6.5 [Call the contract function](#65-call-the-contract-function)
   - 6.6 [Complete `getBeneficiaryBalance` function](#66-complete-getbeneficiarybalance-function)
7. [Using it in a React component](#7-using-it-in-a-react-component)
8. [Using it as a React hook](#8-using-it-as-a-react-hook)
9. [Address mappings summary](#9-address-mappings-summary)
10. [Common errors and fixes](#10-common-errors-and-fixes)

---

## 1. What problem are we solving?

You have a **smart contract** deployed on the blockchain.  
Beneficiaries have token balances stored inside that contract.  
You want to **read a beneficiary's balance** directly from the blockchain, **not via any server/API**.

The flow is:
```
Frontend
  └─► read rpcUrl from localStorage (to connect to blockchain)
  └─► read contract addresses from localStorage
  └─► connect to blockchain using ethers.js
  └─► create contract instance (ABI + contract address + provider)
  └─► call checkBeneficiaryBalance(tokenAddress, projectAddress, beneficiaryAddress)
  └─► get balance (uint256 BigInt)
```

No backend. No API. Just a direct read from the blockchain.

---

## 2. Understanding the localStorage settings

Your app stores these settings in localStorage. The key is `"rahat-app-settings"` and the value is a JSON array:

```json
[
  {
    "id": "b2cc39dd-b68f-4fb0-bc10-fa3907579f2f",
    "name": "blockchain",
    "value": {
      "rpcUrl": "https://base-sepolia.g.alchemy.com/v2/yCToD_5zX3QBjftdawuUm5OTlAD6idH7",
      "chainId": 84532,
      "network": "BaseSepolia",
      "explorer": "https://sepolia.basescan.org/"
    },
    "dataType": "OBJECT",
    "requiredFields": ["network", "rpcUrl", "chainId", "explorer"],
    "isReadOnly": false,
    "isPrivate": false
  },
  {
    "id": "b3a9814e-e01d-4f4f-8b05-622cba81dbf8",
    "name": "contract",
    "value": {
      "token": {
        "address": "0x9b5a4e041ab18a84f154167569806a55bf53439c"
      },
      "fundStorageContract": {
        "address": "0xca602d481dbdcd046200c0b4b394b6d2ca5ff79c"
      }
    },
    "dataType": "OBJECT",
    "requiredFields": ["token", "fundStorageContract"],
    "isReadOnly": false,
    "isPrivate": false
  }
]
```

### What we need from these settings

| Setting field                          | Used as                   | Description                                   |
|----------------------------------------|---------------------------|-----------------------------------------------|
| `blockchain.value.rpcUrl`              | Provider URL              | RPC endpoint to connect to the blockchain     |
| `blockchain.value.chainId`             | Chain verification        | Makes sure you are on the right network       |
| `contract.value.token.address`         | `_tokenAddress` argument  | The token contract address                    |
| `contract.value.fundStorageContract.address` | Contract address + `_projectAddress` argument | The deployed FundStorage contract address AND the project address parameter |

> **Why `fundStorageContract.address` is used twice?**  
> The `checkBeneficiaryBalance` function takes `_projectAddress` as a parameter  
> to look up balances per-project inside the contract's internal mapping.  
> In this system, the project identifier address = the fundStorage contract address itself.

---

## 3. Understanding the ABI (full explanation)

**ABI = Application Binary Interface**

When a smart contract is compiled, it produces bytecode that the EVM can run.  
The ABI is a JSON description of all the public functions, events, and constructor.  
Your frontend uses the ABI to:
- Know **what functions exist** on the contract
- Know **what arguments** each function takes (and their types)
- Know **what each function returns**
- Encode/decode function calls correctly in the binary format the EVM understands

Without the ABI, `ethers.js` cannot know how to call the contract.

### The full ABI you have

This is the ABI for the `FundStorage` contract:

```json
[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "token",             "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "project",           "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "beneficiaryCount", "type": "uint256" }
    ],
    "name": "BatchBeneficiariesAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "token",       "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "project",     "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "amount",     "type": "uint256" }
    ],
    "name": "BeneficiaryAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "token",       "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "project",     "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "amount",     "type": "uint256" }
    ],
    "name": "BeneficiaryAssignmentConsumed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "vendorContractAddress", "type": "address" }
    ],
    "name": "VendorContractSet",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" },
      { "internalType": "uint256", "name": "_amount",         "type": "uint256" }
    ],
    "name": "assignTokenToBeneficiary",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address",   "name": "_tokenAddress",   "type": "address"   },
      { "internalType": "address",   "name": "_projectAddress", "type": "address"   },
      { "internalType": "address[]", "name": "_beneficiaries",  "type": "address[]" },
      { "internalType": "uint256[]", "name": "_amounts",        "type": "uint256[]" }
    ],
    "name": "assignTokensToBeneficiaries",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "beneficiaryAssignment",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" }
    ],
    "name": "checkBeneficiaryBalance",
    "outputs": [{ "internalType": "uint256", "name": "balance", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" },
      { "internalType": "uint256", "name": "_amount",         "type": "uint256" }
    ],
    "name": "consumeBeneficiaryAssignment",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_vendorContract", "type": "address" }
    ],
    "name": "setVendorContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vendorContract",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
]
```

### ABI section-by-section explanation

#### `"type": "constructor"`
```json
{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }
```
- Runs **once** when the contract is deployed. You **never call this** from your frontend.
- `nonpayable` = it did not accept ETH at deploy time.

#### `"type": "event"` entries

Events are **emitted by the contract** when something happens on-chain (like assigning tokens to a beneficiary).  
You **do not call** events. They are useful for:
- Listening to blockchain activity in real-time
- Reading historical activity via `getLogs`

For our purpose (reading balance), we ignore all events.

| Event name                    | When it fires                                          |
|-------------------------------|--------------------------------------------------------|
| `BeneficiaryAssigned`         | When a single beneficiary is assigned tokens           |
| `BeneficiaryAssignmentConsumed` | When a beneficiary redeems/uses their tokens         |
| `BatchBeneficiariesAssigned`  | When multiple beneficiaries are assigned at once       |
| `VendorContractSet`           | When the vendor contract address is configured         |

#### `"stateMutability": "view"` functions — **read-only, no gas, no transaction**

These are safe to call from any frontend. They only read data.

| Function                    | What it does                                                                      |
|-----------------------------|-----------------------------------------------------------------------------------|
| `checkBeneficiaryBalance`   | Returns token balance for a beneficiary under a specific project and token        |
| `beneficiaryAssignment`     | Direct mapping lookup (raw storage) — same data as `checkBeneficiaryBalance`     |
| `owner`                     | Returns the owner address of the contract                                         |
| `vendorContract`            | Returns the configured vendor contract address                                    |

**`checkBeneficiaryBalance` is the one you need.**

#### `"stateMutability": "nonpayable"` functions — **write operations, need gas + signer**

These change blockchain state. You **cannot call them without a wallet/signer**.  
They are **not needed** for reading balance.

| Function                        | What it does                                          |
|---------------------------------|-------------------------------------------------------|
| `assignTokenToBeneficiary`      | Assigns tokens to a single beneficiary                |
| `assignTokensToBeneficiaries`   | Assigns tokens to multiple beneficiaries at once      |
| `consumeBeneficiaryAssignment`  | Marks tokens as consumed (e.g., redeemed by vendor)   |
| `setVendorContract`             | Configures the vendor contract address                |

---

## 4. What is ethers.js and why do we use it?

`ethers.js` is a JavaScript/TypeScript library that lets you:
- **Connect to the blockchain** via an RPC URL (like Alchemy, Infura)
- **Read contract state** without a wallet
- **Send transactions** when you have a wallet/signer
- **Encode/decode** EVM function calls using the ABI

For our use case (reading balance), we only need:
- `JsonRpcProvider` — connects to blockchain using the RPC URL
- `Contract` — wraps a contract address + ABI so you can call functions as if they are regular JavaScript functions

---

## 5. Install ethers.js

In this project:

```bash
# npm
npm install ethers

```

Verify it's installed:
```bash
node -e "const { ethers } = require('ethers'); console.log(ethers.version)"
```

> This guide uses **ethers v6**. If you see `ethers.providers.JsonRpcProvider`, that is v5 syntax.  
> In v6 it is `ethers.JsonRpcProvider`. Make sure you install v6+.

---

## 6. Step-by-step implementation

### 6.1 Create the ABI file

Create a file `src/constants/fundStorageAbi.ts`:

```ts
// src/constants/fundStorageAbi.ts

/**
 * ABI for the FundStorage smart contract.
 *
 * This contract manages token allocations for beneficiaries,
 * organized by (token, project, beneficiary) triplets.
 *
 * We only need the read (view) functions for balance checking.
 * The full ABI is included here for completeness.
 */
export const FUND_STORAGE_ABI = [
  // ─── constructor (ignore in frontend) ──────────────────────────────────────
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },

  // ─── events (for logs/history, not needed for balance read) ────────────────
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "token",             "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "project",           "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "beneficiaryCount", "type": "uint256" }
    ],
    "name": "BatchBeneficiariesAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "token",       "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "project",     "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "amount",     "type": "uint256" }
    ],
    "name": "BeneficiaryAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "token",       "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "project",     "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "uint256",  "name": "amount",     "type": "uint256" }
    ],
    "name": "BeneficiaryAssignmentConsumed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "vendorContractAddress", "type": "address" }
    ],
    "name": "VendorContractSet",
    "type": "event"
  },

  // ─── view functions (read-only, no gas needed) ─────────────────────────────

  /**
   * checkBeneficiaryBalance
   * ─────────────────────────────────────────────────────────────────────────
   * THIS IS THE MAIN FUNCTION YOU NEED.
   *
   * Returns how many tokens a beneficiary has under a specific
   * (token, project) pair.
   *
   * Parameters:
   *   _tokenAddress   — the ERC-20 token contract address
   *   _projectAddress — the project identifier address (fundStorageContract.address)
   *   _beneficiary    — the beneficiary's wallet address
   *
   * Returns:
   *   balance (uint256) — raw token units (not formatted, no decimals applied)
   */
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" }
    ],
    "name": "checkBeneficiaryBalance",
    "outputs": [
      { "internalType": "uint256", "name": "balance", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  /**
   * beneficiaryAssignment
   * Raw mapping: (token, project, beneficiary) => uint256
   * This is the underlying storage. checkBeneficiaryBalance wraps this.
   */
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "beneficiaryAssignment",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  /**
   * owner — returns the contract owner address
   */
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  /**
   * vendorContract — returns the configured vendor contract address
   */
  {
    "inputs": [],
    "name": "vendorContract",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // ─── nonpayable (write) functions — require signer + gas ───────────────────
  // Included for completeness. NOT needed for reading balance.

  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" },
      { "internalType": "uint256", "name": "_amount",         "type": "uint256" }
    ],
    "name": "assignTokenToBeneficiary",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address",   "name": "_tokenAddress",   "type": "address"   },
      { "internalType": "address",   "name": "_projectAddress", "type": "address"   },
      { "internalType": "address[]", "name": "_beneficiaries",  "type": "address[]" },
      { "internalType": "uint256[]", "name": "_amounts",        "type": "uint256[]" }
    ],
    "name": "assignTokensToBeneficiaries",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" },
      { "internalType": "uint256", "name": "_amount",         "type": "uint256" }
    ],
    "name": "consumeBeneficiaryAssignment",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_vendorContract", "type": "address" }
    ],
    "name": "setVendorContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
```

> **Why `as const`?**  
> TypeScript reads the ABI as a static tuple instead of a generic array. This gives you full  
> type inference when calling contract functions — autocomplete will know the function names  
> and argument types.

---

### 6.2 Create the settings loader

Create a file `src/utils/appSettings.ts`:

```ts
// src/utils/appSettings.ts

/**
 * Shape of the blockchain settings stored in localStorage.
 */
export interface BlockchainSetting {
  rpcUrl: string;
  chainId: number;
  network: string;
  explorer: string;
}

/**
 * Shape of the contract settings stored in localStorage.
 */
export interface ContractSetting {
  token: {
    address: string;
  };
  fundStorageContract: {
    address: string;
  };
}

/**
 * A single settings entry from the localStorage array.
 */
interface AppSettingEntry<T = unknown> {
  id: string;
  name: string;
  value: T;
  dataType: string;
  requiredFields: string[];
  isReadOnly: boolean;
  isPrivate: boolean;
}

/**
 * Reads the settings array from localStorage and finds the entry with the given name.
 *
 * @param name - e.g. "blockchain" or "contract"
 * @param storageKey - the localStorage key that holds the settings array (default: "settings")
 * @returns the `value` field of the matching entry
 * @throws Error if settings not found or the named entry is missing
 *
 * Why this function?
 * ------------------
 * Settings are stored as an array in localStorage:
 *   [{ name: "blockchain", value: {...} }, { name: "contract", value: {...} }]
 * We need to look up by name and extract the `value` field.
 */
export function getAppSettingByName<T>(name: string, storageKey = 'settings'): T {
  const raw = localStorage.getItem(storageKey);

  if (!raw) {
    throw new Error(
      `[getAppSettingByName] No settings found in localStorage under key "${storageKey}". ` +
      `Make sure settings are loaded into localStorage before calling this function.`
    );
  }

  let parsed: AppSettingEntry[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `[getAppSettingByName] Failed to parse settings from localStorage key "${storageKey}". ` +
      `Expected a JSON array.`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `[getAppSettingByName] Settings in localStorage is not an array. Got: ${typeof parsed}`
    );
  }

  const entry = parsed.find((item) => item?.name === name);

  if (!entry) {
    throw new Error(
      `[getAppSettingByName] Setting named "${name}" not found in localStorage settings. ` +
      `Available names: ${parsed.map((x) => x?.name).join(', ')}`
    );
  }

  return entry.value as T;
}

/**
 * Convenience shortcut for blockchain settings.
 */
export function getBlockchainSetting(): BlockchainSetting {
  return getAppSettingByName<BlockchainSetting>('blockchain');
}

/**
 * Convenience shortcut for contract settings.
 */
export function getContractSetting(): ContractSetting {
  return getAppSettingByName<ContractSetting>('contract');
}
```

---

### 6.3 Create the provider

A **provider** is a read-only connection to the blockchain.  
It does not need a wallet — it only reads data.

```ts
import { ethers } from 'ethers';

// Connect to the blockchain using the RPC URL from settings.
// JsonRpcProvider sends JSON-RPC requests to the node (Alchemy/Infura/etc.)
const provider = new ethers.JsonRpcProvider(rpcUrl);
```

> **RPC URL** is a public HTTPS endpoint (e.g. Alchemy) that connects you to a blockchain node.  
> `JsonRpcProvider` wraps this URL so ethers can send requests like `eth_call`, `eth_getBalance`, etc.

---

### 6.4 Create the contract instance

A **Contract instance** combines:
- The **contract address** (where it is deployed on-chain)
- The **ABI** (how to encode/decode calls)
- A **provider** (or signer if you want to write)

```ts
import { ethers } from 'ethers';
import { FUND_STORAGE_ABI } from '../constants/fundStorageAbi';

const fundStorageContract = new ethers.Contract(
  fundStorageContractAddress,  // address of the deployed contract
  FUND_STORAGE_ABI,            // ABI describing its functions
  provider                     // read-only connection to blockchain
);
```

Now `fundStorageContract.checkBeneficiaryBalance(...)` is a callable function.  
Ethers automatically encodes the arguments, sends the RPC call, and decodes the response.

---

### 6.5 Call the contract function

```ts
const balance: bigint = await fundStorageContract.checkBeneficiaryBalance(
  tokenAddress,         // _tokenAddress  → contract.token.address
  projectAddress,       // _projectAddress → contract.fundStorageContract.address
  beneficiaryAddress    // _beneficiary   → beneficiary's wallet address
);

// balance is a BigInt (uint256 from Solidity)
// To convert to a regular number string:

// If the token has 18 decimals (like most ERC-20), format it:

// If the token has 6 decimals (like USDC/USDT):
```

> **Why BigInt?**  
> Solidity `uint256` can hold numbers much larger than JavaScript's safe integer range.  
> ethers v6 returns `BigInt` for all `uint256` values. Never try to do `Number(balance)` for  
> large values — use `.toString()` or `ethers.formatUnits()`.

---

### 6.6 Complete `getBeneficiaryBalance` function

Create a file `src/utils/getBeneficiaryBalance.ts`:

```ts
// src/utils/getBeneficiaryBalance.ts

import { ethers } from 'ethers';
import { FUND_STORAGE_ABI } from '../constants/fundStorageAbi';
import { getBlockchainSetting, getContractSetting } from './appSettings';

/**
 * Reads a beneficiary's token balance directly from the FundStorage smart contract.
 *
 * This does NOT hit any backend API. It talks directly to the blockchain
 * using the RPC URL configured in app settings.
 *
 * How it works:
 * 1. Reads blockchain settings (rpcUrl) from localStorage
 * 2. Reads contract addresses (token, fundStorage) from localStorage
 * 3. Creates a read-only provider using the rpcUrl
 * 4. Creates a contract instance with ABI + fundStorage address + provider
 * 5. Calls checkBeneficiaryBalance(tokenAddress, projectAddress, beneficiaryAddress)
 * 6. Returns the balance as a string (raw uint256 value)
 *
 * @param beneficiaryAddress - The wallet address of the beneficiary
 * @returns Raw balance string (uint256, no decimals applied)
 *
 * @example
 * const balance = await getBeneficiaryBalance('0xAbCd...');
 */
export async function getBeneficiaryBalance(
  beneficiaryAddress: string
): Promise<string> {
  // Step 1: Load settings from localStorage
  const blockchainSetting = getBlockchainSetting();
  const contractSetting = getContractSetting();

  const rpcUrl = blockchainSetting.rpcUrl;

  // Address mappings:
  // _tokenAddress   = token.address  (the ERC-20 token the beneficiary holds)
  // _projectAddress = fundStorageContract.address  (the project identifier)
  // _beneficiary    = beneficiaryAddress  (the beneficiary's wallet)
  const tokenAddress = contractSetting.token.address;
  const fundStorageContractAddress = contractSetting.fundStorageContract.address;
  const projectAddress = fundStorageContractAddress;

  // Step 2: Create a read-only provider
  // JsonRpcProvider connects to the blockchain node via HTTPS (no wallet needed)
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Step 3: Create contract instance
  // This combines: where the contract is (address) + what it can do (ABI) + connection (provider)
  const fundStorage = new ethers.Contract(
    fundStorageContractAddress,
    FUND_STORAGE_ABI,
    provider
  );

  // Step 4: Call the view function
  // view functions are free (no gas), they just read blockchain state
  const balance: bigint = await fundStorage.checkBeneficiaryBalance(
    tokenAddress,
    projectAddress,
    beneficiaryAddress
  );

  // Step 5: Return as string
  // balance is uint256 (BigInt) — convert to string to avoid precision issues
  return balance.toString();
}

/**
 * Same as getBeneficiaryBalance but returns the formatted value with decimals.
 *
 * @param beneficiaryAddress - The wallet address of the beneficiary
 * @param decimals - Token decimal places (default: 18 for standard ERC-20)
 * @returns Formatted balance string (e.g. "1.5" instead of "1500000000000000000")
 *
 * @example
 * const balance = await getBeneficiaryBalanceFormatted('0xAbCd...', 18);
 */
export async function getBeneficiaryBalanceFormatted(
  beneficiaryAddress: string,
  decimals = 18
): Promise<string> {
  const raw = await getBeneficiaryBalance(beneficiaryAddress);
  return ethers.formatUnits(raw, decimals);
}
```

---

## 7. Using it in a React component

Here is a complete example component that reads a beneficiary balance:

```tsx
// src/components/BeneficiaryBalance.tsx

import React, { useState } from 'react';
import { getBeneficiaryBalance } from '../utils/getBeneficiaryBalance';

interface Props {
  beneficiaryAddress: string;
}

export function BeneficiaryBalance({ beneficiaryAddress }: Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    try {
      const result = await getBeneficiaryBalance(beneficiaryAddress);
      setBalance(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Get Balance'}
      </button>

      {balance !== null && (
        <p>Balance: <strong>{balance}</strong></p>
      )}

      {error && (
        <p style={{ color: 'red' }}>Error: {error}</p>
      )}
    </div>
  );
}
```

---

## 8. Using it as a React hook

A hook gives you cleaner state management with loading/error states:

```ts
// src/hooks/useBeneficiaryBalance.ts

import { useState, useCallback } from 'react';
import { getBeneficiaryBalance } from '../utils/getBeneficiaryBalance';

interface UseBeneficiaryBalanceResult {
  balance: string | null;
  loading: boolean;
  error: string | null;
  fetchBalance: (beneficiaryAddress: string) => Promise<void>;
}

/**
 * React hook to fetch beneficiary balance on-chain.
 *
 * Usage:
 *   const { balance, loading, error, fetchBalance } = useBeneficiaryBalance();
 *   await fetchBalance('0xBeneficiaryAddress...');
 */
export function useBeneficiaryBalance(): UseBeneficiaryBalanceResult {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (beneficiaryAddress: string) => {
    if (!beneficiaryAddress) {
      setError('Beneficiary address is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getBeneficiaryBalance(beneficiaryAddress);
      setBalance(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch beneficiary balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { balance, loading, error, fetchBalance };
}
```

Usage in a component:
```tsx
import { useBeneficiaryBalance } from '../hooks/useBeneficiaryBalance';

function SomePage() {
  const { balance, loading, error, fetchBalance } = useBeneficiaryBalance();

  // Call after you have the beneficiary address (e.g. from a form or API lookup)
  async function onBeneficiaryFound(walletAddress: string) {
    await fetchBalance(walletAddress);
    // balance is now available
  }

  return (
    <div>
      {loading && <p>Fetching balance from blockchain...</p>}
      {error && <p>Error: {error}</p>}
      {balance !== null && <p>Balance: {balance}</p>}
    </div>
  );
}
```

---

## 9. Address mappings summary

| Contract parameter   | Where it comes from in localStorage          | Example value                                |
|----------------------|----------------------------------------------|----------------------------------------------|
| Contract address     | `contract.fundStorageContract.address`       | `0xca602d481dbdcd046200c0b4b394b6d2ca5ff79c` |
| `_tokenAddress`      | `contract.token.address`                     | `0x9b5a4e041ab18a84f154167569806a55bf53439c` |
| `_projectAddress`    | `contract.fundStorageContract.address`       | `0xca602d481dbdcd046200c0b4b394b6d2ca5ff79c` |
| `_beneficiary`       | beneficiary's wallet address (from API/DB)   | `0xABC...`                                   |
| Provider RPC URL     | `blockchain.rpcUrl`                          | `https://base-sepolia.g.alchemy.com/v2/...`  |

> **Note on `_projectAddress`**: The same address is used for both the contract address and the  
> `_projectAddress` argument. This is because the `FundStorage` contract stores balances in a  
> nested mapping: `(tokenAddress => (projectAddress => (beneficiary => balance)))`.  
> The project is identified by its own contract address, and in this case the project IS  
> the FundStorage contract itself.

---

## 10. Common errors and fixes

### `Error: No settings found in localStorage`
- Settings have not been saved to localStorage yet.
- Check: `localStorage.getItem('settings')` in your browser's DevTools console.
- Make sure your app loads and saves settings before calling `getBeneficiaryBalance`.
- Verify the localStorage key name — it might not be `"settings"`. Adjust the `storageKey` param in `getAppSettingByName`.

### `Error: could not detect network`
- The RPC URL is wrong or the network is down.
- Check if `blockchain.rpcUrl` is a valid Alchemy/Infura HTTPS URL.
- Make sure the URL includes your API key (not expired).

### `Error: bad address checksum` or `invalid address`
- One of the addresses is lowercase and ethers is strict.
- Wrap addresses with `ethers.getAddress(address)` to normalize them:
  ```ts
  import { ethers } from 'ethers';
  const checksummedAddress = ethers.getAddress('0xca602d...');
  ```

### `balance` returns `0n` (BigInt zero) but you expect a value
- Verify you are passing the correct `_projectAddress`. A wrong project address returns 0.
- Verify you are on the correct network (chainId `84532` = Base Sepolia).
- Check that the beneficiary was actually assigned tokens in the contract.

### `TypeError: fundStorage.checkBeneficiaryBalance is not a function`
- The ABI is incorrect or the function name has a typo.
- Double-check that `"name": "checkBeneficiaryBalance"` is in your ABI.
- Make sure you imported the correct ABI file.

### CORS errors in browser
- Some RPC URLs block browser requests. Use an Alchemy or Infura URL with your project's  
  allowed origins configured, or set `Access-Control-Allow-Origin` on your RPC endpoint.

---

## Quick reference — minimum code to get balance

If you just want the shortest possible working snippet (no TypeScript, no abstraction):

```js
import { ethers } from 'ethers';

const FUND_STORAGE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress",   "type": "address" },
      { "internalType": "address", "name": "_projectAddress", "type": "address" },
      { "internalType": "address", "name": "_beneficiary",    "type": "address" }
    ],
    "name": "checkBeneficiaryBalance",
    "outputs": [{ "internalType": "uint256", "name": "balance", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

async function getBalance(beneficiaryWalletAddress) {
  // 1. Read settings from localStorage
  const settings = JSON.parse(localStorage.getItem('settings'));
  const blockchain = settings.find(s => s.name === 'blockchain').value;
  const contract  = settings.find(s => s.name === 'contract').value;

  // 2. Connect to blockchain
  const provider = new ethers.JsonRpcProvider(blockchain.rpcUrl);

  // 3. Create contract instance
  const fundStorage = new ethers.Contract(
    contract.fundStorageContract.address,  // contract is deployed here
    FUND_STORAGE_ABI,
    provider
  );

  // 4. Call the function
  const balance = await fundStorage.checkBeneficiaryBalance(
    contract.token.address,               // _tokenAddress
    contract.fundStorageContract.address, // _projectAddress
    beneficiaryWalletAddress              // _beneficiary
  );

  return balance.toString();
}

// Example usage:
getBalance('0xYourBeneficiaryWalletAddress').then(console.log);
```

---

## File structure for your new project

```
src/
  constants/
    fundStorageAbi.ts       ← paste the ABI here
  utils/
    appSettings.ts          ← reads from localStorage
    getBeneficiaryBalance.ts← main function
  hooks/
    useBeneficiaryBalance.ts← React hook (optional)
  components/
    BeneficiaryBalance.tsx  ← example component (optional)
```

---

*This guide was created from the `rahat-rp-vendor-app` codebase patterns as a standalone reference  
for implementing on-chain beneficiary balance reads in a new project.*
