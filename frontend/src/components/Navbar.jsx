import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useLang } from "../context/LanguageContext";
import { shortAddress } from "../utils/contract";
import { Leaf, Wallet, ChevronDown, LogOut, Copy, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, chainId } = useWeb3();
  const { lang, toggleLang, t } = useLang();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: t("nav", "home") },
    { path: "/farmer", label: `🌾 ${t("nav", "farmer")}` },
    { path: "/processor", label: `⚙️ ${t("nav", "processor")}` },
    { path: "/distributor", label: `🚛 ${t("nav", "distributor")}` },
    { path: "/retailer", label: `🏪 ${t("nav", "retailer")}` },
    { path: "/consumer", label: `📦 ${t("nav", "consumer")}` },
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success(t("nav", "copy"));
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-dark-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-sm leading-none">
                {lang === "mr" ? "शेत-ते-काटा" : "Farm-to-Fork"}
              </span>
              <p className="text-xs text-primary-400 leading-none mt-0.5">
                {lang === "mr" ? "Blockchain ट्रॅकर" : "Blockchain Tracker"}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  location.pathname === link.path
                    ? "bg-primary-600/20 text-primary-300"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Lang toggle + Network + Wallet + Mobile */}
          <div className="flex items-center gap-2">

            {/* 🌐 Language Toggle */}
            <button
              onClick={toggleLang}
              title={lang === "en" ? "Switch to Marathi" : "Switch to English"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all text-sm font-semibold text-gray-300"
            >
              <span className="text-base">{lang === "en" ? "🇮🇳" : "🇬🇧"}</span>
              <span className="hidden sm:block text-xs">
                {lang === "en" ? "मराठी" : "English"}
              </span>
            </button>

            {/* Network indicator */}
            {isConnected && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                <span className="text-xs text-primary-300 font-medium">
                  Sepolia Live
                </span>
              </div>
            )}

            {/* Wallet Button */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/10 hover:border-white/25 transition-all text-sm font-medium text-gray-200"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-emerald-400" />
                  <span className="hidden sm:block">{shortAddress(account)}</span>
                  <ChevronDown size={14} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-card py-2 z-50 animate-in">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs text-gray-400">{t("nav", "connected")}</p>
                      <p className="text-sm font-mono text-gray-200 mt-0.5">{shortAddress(account)}</p>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Copy size={14} />
                      {t("nav", "copy")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary text-sm py-2 px-4"
              >
                <Wallet size={15} />
                {isConnecting ? t("nav", "connecting") : t("nav", "connect")}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobile(!showMobile)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              {showMobile ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobile && (
        <div className="lg:hidden border-t border-white/10 bg-dark-800/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setShowMobile(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary-600/20 text-primary-300"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* Language toggle in mobile */}
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5"
          >
            <span>{lang === "en" ? "🇮🇳" : "🇬🇧"}</span>
            {lang === "en" ? "मराठीत बदला" : "Switch to English"}
          </button>
        </div>
      )}

      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </nav>
  );
}
