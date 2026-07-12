import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { fetchBatch, getReadContract, shortAddress } from "../utils/contract";
import Timeline from "../components/Timeline";
import StepBadge from "../components/StepBadge";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { ArrowLeft, Leaf, Loader, AlertCircle, RefreshCw, QrCode } from "lucide-react";
import toast from "react-hot-toast";

export default function TrackBatch() {
  const { batchId } = useParams();
  const { t } = useLang();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const loadBatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = parseInt(batchId);
      if (isNaN(id) || id < 1) {
        setError("Invalid Batch ID");
        return;
      }
      const contract = getReadContract();
      const exists = await contract.batchExistsCheck(id);
      if (!exists) {
        setError(`Batch #${id} does not exist on the blockchain`);
        return;
      }
      const data = await fetchBatch(id, contract);
      setBatch(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load batch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatch();
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-gray-400">{t("track", "loading")}</p>
          <p className="text-xs text-gray-600 mt-1">Batch #{batchId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="text-center glass-card p-10 max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">{t("track", "notFound")}</h2>
          <p className="text-gray-400 mb-6 text-sm">{error}</p>
          <div className="flex gap-3">
            <Link to="/consumer" className="btn-secondary flex-1">
              <ArrowLeft size={14} />
              {t("track", "back")}
            </Link>
            <button onClick={loadBatch} className="btn-primary flex-1">
              <RefreshCw size={14} />
              {t("track", "retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 blockchain-bg">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/consumer"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft size={14} />
          {t("track", "back")}
        </Link>

        {/* Batch Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 font-mono">Batch #{batch.id}</span>
                <StepBadge state={batch.state} />
              </div>
              <h1 className="font-display font-black text-3xl text-white mb-1">
                {batch.harvest.cropName}
              </h1>
              <p className="text-gray-400 text-sm">
                {batch.harvest.quantity} kg · {batch.harvest.location}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="btn-secondary text-sm py-2 px-4"
              >
                <QrCode size={14} />
                {showQR ? t("track", "hideQR") : t("track", "shareQR")}
              </button>
              <button onClick={loadBatch} className="btn-secondary text-sm py-2 px-4">
                <RefreshCw size={14} />
                {t("track", "refresh")}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>🌾 Farm</span>
              <span>⚙️ Process</span>
              <span>🚛 Ship</span>
              <span>🏪 Retail</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${((batch.state + 1) / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">
              {t("track", "stage")} {batch.state + 1} {t("track", "of")} 4
            </p>
          </div>
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="mb-6 animate-in">
            <QRCodeDisplay batchId={batch.id} />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-xl text-white mb-5 flex items-center gap-2">
              <Leaf size={18} className="text-primary-400" />
              {t("track", "timelineTitle")}
            </h2>
            <Timeline batch={batch} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Verification badge */}
            <div className="glass-card p-4 border border-primary-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  {t("track", "blockchainVerified")}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t("track", "verifiedDesc")}
              </p>
            </div>

            {/* Key Facts */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">📋 {t("track", "keyFacts")}</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t("track", "batchId")}</span>
                  <span className="text-xs font-mono text-gray-300">#{batch.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t("track", "crop")}</span>
                  <span className="text-xs text-gray-300">{batch.harvest.cropName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t("track", "quantity")}</span>
                  <span className="text-xs text-gray-300">{batch.harvest.quantity} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t("track", "origin")}</span>
                  <span className="text-xs text-gray-300">{batch.harvest.location}</span>
                </div>
                {batch.process && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t("track", "qualityGrade")}</span>
                    <span className="text-xs font-semibold text-green-400">
                      Grade {batch.process.qualityGrade}
                    </span>
                  </div>
                )}
                {batch.deliver && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t("track", "received")}</span>
                    <span className="text-xs text-gray-300">{batch.deliver.receivedQty} kg</span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Addresses */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">🔗 {t("track", "addresses")}</h3>
              <div className="space-y-2">
                {[
                  { label: "Farmer", addr: batch.farmer },
                  { label: "Processor", addr: batch.processor },
                  { label: "Distributor", addr: batch.distributor },
                  { label: "Retailer", addr: batch.retailer },
                ].map(
                  ({ label, addr }) =>
                    addr &&
                    addr !== "0x0000000000000000000000000000000000000000" && (
                      <div key={label}>
                        <p className="text-xs text-gray-600 mb-0.5">{label}</p>
                        <p className="text-xs font-mono text-gray-400 break-all">{addr}</p>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
