import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL } from "../utils/contract";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // App Wallet Logic
  const initializeAppWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const privateKey = import.meta.env.VITE_APP_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("App Wallet private key is not configured in .env");
      }

      const web3Provider = new ethers.JsonRpcProvider(RPC_URL);
      const appWallet = new ethers.Wallet(privateKey, web3Provider);
      
      setProvider(web3Provider);
      setSigner(appWallet);
      setAccount(appWallet.address);

      if (CONTRACT_ADDRESS) {
        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, appWallet);
        setContract(c);
      }
      
      console.log("App Wallet initialized successfully.");
    } catch (err) {
      console.error("App Wallet initialization error:", err);
      toast.error(err.message || "Failed to initialize App Wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Initialize automatically on load
  useEffect(() => {
    initializeAppWallet();
  }, [initializeAppWallet]);

  // Dummy functions to satisfy existing UI components without breaking them
  const connectWallet = async () => {
    toast.success("App Wallet is already connected automatically!");
  };

  const disconnectWallet = () => {
    toast.error("App Wallet cannot be disconnected.");
  };

  const value = {
    account,
    provider,
    signer,
    contract,
    chainId: 11155111, // Hardcoded to Sepolia
    isConnecting,
    isCorrectNetwork: true, // Always true for App Wallet
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
