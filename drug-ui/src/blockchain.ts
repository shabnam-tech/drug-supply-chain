import { ethers } from "ethers";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ?? "0x5024a29202582255D50c251ae08CFA5B46174B7C";
const RPC_URL = import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:8545";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY ?? "";
const USE_METAMASK = import.meta.env.VITE_USE_METAMASK === "true";

const ABI = [
  "function registerBatch(string _batchId, string _drugName, int256 _minTemp, int256 _maxTemp)",
  "function getStatus(string _batchId) view returns (string)",
  "function getBatchIds() view returns (string[])",
  "function recordTemperature(string _batchId, int256 _temp)",
  "function transferBatch(string _batchId, string _newOwner)",
  "function batches(string) view returns (string batchId, string drugName, int256 minTemp, int256 maxTemp, string owner, string status)"
];

export type DrugBatch = {
  batchId: string;
  drugName: string;
  minTemp: number;
  maxTemp: number;
  owner: string;
  status: string;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
};

type GetContractOptions = {
  requireSigner?: boolean;
};

export const getContract = async (options: GetContractOptions = {}) => {
  const { requireSigner = false } = options;

  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address is missing. Set VITE_CONTRACT_ADDRESS.");
  }

  if (!requireSigner) {
    if (USE_METAMASK && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      return new ethers.Contract(CONTRACT_ADDRESS, ABI, browserProvider);
    }

    const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, rpcProvider);
  }

  if (PRIVATE_KEY) {
    const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, rpcProvider);
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  if (USE_METAMASK && window.ethereum) {
    await connectWallet();
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  throw new Error(
    "No signer available. Set VITE_PRIVATE_KEY for local dev or enable MetaMask with VITE_USE_METAMASK=true."
  );
};

export const getBatchDetails = async (batchId: string): Promise<DrugBatch | null> => {
  const contract = await getContract();
  const details = await contract.batches(batchId);

  if (!details || !details.batchId) {
    return null;
  }

  return {
    batchId: details.batchId,
    drugName: details.drugName,
    minTemp: Number(details.minTemp),
    maxTemp: Number(details.maxTemp),
    owner: details.owner,
    status: details.status,
  };
};

export const getAllBatches = async (): Promise<DrugBatch[]> => {
  const contract = await getContract();
  const ids: string[] = await contract.getBatchIds();
  if (!ids.length) {
    return [];
  }

  const rows = await Promise.all(ids.map((id) => getBatchDetails(id)));
  return rows.filter((row): row is DrugBatch => row !== null);
};