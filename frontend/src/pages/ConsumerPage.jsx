import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { getReadContract, fetchBatch } from "../utils/contract";
import { Search, Scan, Package, ArrowRight, Loader, X, Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function ConsumerPage() {
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerRef, setScannerRef] = useState(null);
  const { t } = useLang();
  const navigate = useNavigate();
  const scannerContainerId = "consumer-qr-scanner";

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!batchId.trim()) return toast.error("Enter a Batch ID");
    const id = parseInt(batchId.trim());
    if (isNaN(id) || id < 1) return toast.error("Invalid Batch ID");

    setLoading(true);
    try {
      const contract = getReadContract();
      const exists = await contract.batchExistsCheck(id);
      if (!exists) {
        toast.error(`Batch #${id} does not exist on the blockchain`);
        return;
      }
      navigate(`/track/${id}`);
    } catch (err) {
      toast.error("Failed to check batch: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setScanning(true);
    try {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      const scanner = new Html5QrcodeScanner(
        scannerContainerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(
        (decodedText) => {
          // Try to extract batch ID from URL
          const match = decodedText.match(/\/track\/(\d+)/);
          if (match) {
            scanner.clear();
            setScanning(false);
            navigate(`/track/${match[1]}`);
          } else {
            // Try if it's just a number
            const num = parseInt(decodedText.trim());
            if (!isNaN(num)) {
              scanner.clear();
              setScanning(false);
              navigate(`/track/${num}`);
            } else {
              toast.error("Invalid QR code — not a Farm-to-Fork tracking code");
            }
          }
        },
        (error) => {
          // Silent scan errors
        }
      );
      setScannerRef(scanner);
    } catch (err) {
      toast.error("QR scanner failed to load");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef) {
      scannerRef.clear().catch(() => {});
      setScannerRef(null);
    }
    setScanning(false);
  };

  const recentBatches = [1, 2, 3]; // Placeholder quick access

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-600 to-rose-500 flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl shadow-pink-500/20 animate-float">
            📦
          </div>
          <h1 className="font-display font-black text-4xl text-white mb-3">
            {t("consumer", "title")}
          </h1>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
            {t("consumer", "subtitle")}
          </p>
        </div>

        {/* Search Box */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
            <Search size={18} className="text-primary-400" />
            {t("consumer", "searchTitle")}
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="number"
              min="1"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder={t("consumer", "searchPlaceholder")}
              className="input-field flex-1"
            />
            <button type="submit" disabled={loading} className="btn-primary px-6 shrink-0">
              {loading ? <Loader size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* QR Scanner */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
            <Camera size={18} className="text-primary-400" />
            {t("consumer", "scanTitle")}
          </h2>

          {!scanning ? (
            <div className="text-center">
              <div className="w-full h-40 rounded-xl bg-dark-600/50 border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-4 hover:border-primary-500/40 transition-colors cursor-pointer" onClick={startScanner}>
                <Scan size={40} className="text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">{t("consumer", "scanClick")}</p>
                <p className="text-gray-600 text-xs mt-1">{t("consumer", "scanSub")}</p>
              </div>
              <button onClick={startScanner} className="btn-primary w-full">
                <Camera size={16} />
                {t("consumer", "openScanner")}
              </button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <div id={scannerContainerId} className="rounded-xl overflow-hidden" />
                <button
                  onClick={stopScanner}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 z-10"
                >
                  <X size={14} />
                </button>
              </div>
              <button onClick={stopScanner} className="btn-secondary w-full mt-4">
                {t("consumer", "cancelScan")}
              </button>
            </div>
          )}
        </div>

        {/* How to use */}
        <div className="glass-card p-6">
          <h2 className="font-display font-bold text-lg text-white mb-4">
            📋 {t("consumer", "howTitle")}
          </h2>
          <div className="space-y-3">
            {[
              { n: "1", text: t("consumer", "step1") },
              { n: "2", text: t("consumer", "step2") },
              { n: "3", text: t("consumer", "step3") },
              { n: "4", text: t("consumer", "step4") },
            ].map((step) => (
              <div key={step.n} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-300 shrink-0 mt-0.5">
                  {step.n}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* No MetaMask needed note */}
        <div className="mt-6 flex items-center gap-2 justify-center text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {t("consumer", "noMetamask")}
        </div>
      </div>
    </div>
  );
}
