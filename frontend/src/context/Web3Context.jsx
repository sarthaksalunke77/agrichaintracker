import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID } from "../utils/contract";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const switchToSepolia = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], 
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7', // 11155111 in hex
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://rpc.ankr.com/eth_sepolia'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }],
            });
          } catch (addError) {
            console.error("Error adding network:", addError);
          }
        } else {
          console.error("Error switching network:", switchError);
        }
      }
    }
  };

  // ── Connect MetaMask ──────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found! Please install MetaMask.", { duration: 5000 });
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(currentChainId);

      const correct = currentChainId === CHAIN_ID;
      setIsCorrectNetwork(correct);

      if (!correct) {
        toast.error(
          `Wrong network! Switching to Sepolia (Chain ID: ${CHAIN_ID})...`,
          { duration: 4000 }
        );
        await switchToSepolia();
      } else {
        if (CONTRACT_ADDRESS) {
          const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
          setContract(c);
        }
        toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      toast.error(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── Disconnect ────────────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    toast.success("Wallet disconnected");
  }, []);

  // ── Listen for account/chain changes ─────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        if (provider) {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          if (CONTRACT_ADDRESS && isCorrectNetwork) {
            setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner));
          }
        }
        toast(`Account switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, {
          icon: "🔄",
        });
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      const correct = newChainId === CHAIN_ID;
      setIsCorrectNetwork(correct);
      if (!correct) {
        toast.error(`Wrong network! Switch to Sepolia (Chain ID: ${CHAIN_ID})`);
      } else {
        toast.success("Switched to correct network!");
        window.location.reload();
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Auto-connect if previously connected
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    contract,
    chainId,
    isConnecting,
    isCorrectNetwork,
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
