import { ethers } from "ethers";

// ─────────────────────────────────────────────────────────
//  Contract ABI — matches AgriSupplyChain.sol
// ─────────────────────────────────────────────────────────
export const CONTRACT_ABI = [
  // Events
  "event BatchHarvested(uint256 indexed batchId, address indexed farmer, string cropName, uint256 timestamp)",
  "event BatchProcessed(uint256 indexed batchId, address indexed processor, string qualityGrade, uint256 timestamp)",
  "event BatchShipped(uint256 indexed batchId, address indexed distributor, string vehicleNumber, uint256 timestamp)",
  "event BatchDelivered(uint256 indexed batchId, address indexed retailer, string condition, uint256 timestamp)",

  // Write Functions
  "function harvestItem(string cropName, uint256 quantity, string location, uint256 harvestDate, string description, uint256 pricePerKg) external returns (uint256)",
  "function processItem(uint256 batchId, string qualityGrade, int256 temperature, string packagingType, string notes) external",
  "function shipItem(uint256 batchId, string vehicleNumber, string driverName, string origin, string destination, uint256 expectedDelivery) external",
  "function deliverItem(uint256 batchId, string condition, uint256 receivedQty, string remarks) external",

  // Read Functions
  "function getHarvestInfo(uint256 batchId) external view returns (tuple(string cropName, uint256 quantity, string location, uint256 harvestDate, string description, uint256 pricePerKg))",
  "function getProcessInfo(uint256 batchId) external view returns (tuple(string qualityGrade, int256 temperature, string packagingType, uint256 processDate, string notes))",
  "function getShipInfo(uint256 batchId) external view returns (tuple(string vehicleNumber, string driverName, string origin, string destination, uint256 shipDate, uint256 expectedDelivery))",
  "function getDeliverInfo(uint256 batchId) external view returns (tuple(uint256 arrivalDate, string condition, uint256 receivedQty, string remarks))",
  "function getBatchMeta(uint256 batchId) external view returns (uint256 id, address farmer, address processor, address distributor, address retailer, uint8 currentState)",
  "function getBatchCount() external view returns (uint256)",
  "function getAllBatchIds() external view returns (uint256[])",
  "function batchExistsCheck(uint256 batchId) external view returns (bool)",
];

// ─────────────────────────────────────────────────────────
//  Contract Address — read from env (set by deploy script)
// ─────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "11155111");
export const RPC_URL = import.meta.env.VITE_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

// ─────────────────────────────────────────────────────────
//  State Enum mapping
// ─────────────────────────────────────────────────────────
export const STATE_LABELS = ["Harvested", "Processed", "In Transit", "Delivered"];
export const STATE_COLORS = ["yellow", "blue", "orange", "green"];
export const STATE_ICONS = ["🌾", "⚙️", "🚛", "🏪"];

// ─────────────────────────────────────────────────────────
//  Get read-only contract (no wallet needed)
// ─────────────────────────────────────────────────────────
export function getReadContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// ─────────────────────────────────────────────────────────
//  Get write contract (wallet required)
// ─────────────────────────────────────────────────────────
export function getWriteContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ─────────────────────────────────────────────────────────
//  Fetch full batch data (all 4 stages + meta)
// ─────────────────────────────────────────────────────────
export async function fetchBatch(batchId, contractInstance) {
  const contract = contractInstance || getReadContract();

  const [meta, harvest] = await Promise.all([
    contract.getBatchMeta(batchId),
    contract.getHarvestInfo(batchId),
  ]);

  const state = Number(meta.currentState);
  const batch = {
    id: Number(meta.id),
    farmer: meta.farmer,
    processor: meta.processor,
    distributor: meta.distributor,
    retailer: meta.retailer,
    state,
    stateLabel: STATE_LABELS[state],
    harvest: {
      cropName: harvest.cropName,
      quantity: Number(harvest.quantity),
      location: harvest.location,
      harvestDate: Number(harvest.harvestDate),
      description: harvest.description,
      pricePerKg: ethers.formatEther(harvest.pricePerKg),
    },
    process: null,
    ship: null,
    deliver: null,
  };

  if (state >= 1) {
    const p = await contract.getProcessInfo(batchId);
    batch.process = {
      qualityGrade: p.qualityGrade,
      temperature: Number(p.temperature),
      packagingType: p.packagingType,
      processDate: Number(p.processDate),
      notes: p.notes,
    };
  }

  if (state >= 2) {
    const s = await contract.getShipInfo(batchId);
    batch.ship = {
      vehicleNumber: s.vehicleNumber,
      driverName: s.driverName,
      origin: s.origin,
      destination: s.destination,
      shipDate: Number(s.shipDate),
      expectedDelivery: Number(s.expectedDelivery),
    };
  }

  if (state >= 3) {
    const d = await contract.getDeliverInfo(batchId);
    batch.deliver = {
      arrivalDate: Number(d.arrivalDate),
      condition: d.condition,
      receivedQty: Number(d.receivedQty),
      remarks: d.remarks,
    };
  }

  return batch;
}

// ─────────────────────────────────────────────────────────
//  Fetch all batches
// ─────────────────────────────────────────────────────────
export async function fetchAllBatches(contractInstance) {
  const contract = contractInstance || getReadContract();
  const ids = await contract.getAllBatchIds();
  const batches = await Promise.all(
    ids.map((id) => fetchBatch(Number(id), contract))
  );
  return batches;
}

// ─────────────────────────────────────────────────────────
//  Utility: format timestamp to readable date
// ─────────────────────────────────────────────────────────
export function formatDate(timestamp) {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────
//  Utility: shorten address
// ─────────────────────────────────────────────────────────
export function shortAddress(addr) {
  if (!addr || addr === ethers.ZeroAddress) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ─────────────────────────────────────────────────────────
//  Build tracking URL for QR code
// ─────────────────────────────────────────────────────────
export function buildTrackingUrl(batchId) {
  const base = window.location.origin;
  return `${base}/track/${batchId}`;
}
