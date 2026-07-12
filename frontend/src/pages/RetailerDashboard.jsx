import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useLang } from "../context/LanguageContext";
import { fetchAllBatches } from "../utils/contract";
import BatchCard from "../components/BatchCard";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { X, Loader, CheckCircle, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function RetailerDashboard() {
  const { contract, isConnected, connectWallet } = useWeb3();
  const { t } = useLang();
  const [batches, setBatches] = useState([]);
  const [deliveredBatches, setDeliveredBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [form, setForm] = useState({
    condition: "Good",
    receivedQty: "",
    remarks: "",
  });

  const fetchBatches = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const all = await fetchAllBatches(contract);
      setBatches(all.filter((b) => b.state === 2)); // InTransit
      setDeliveredBatches(all.filter((b) => b.state === 3)); // Delivered
    } catch (err) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, [contract]);

  const handleDeliver = async (e) => {
    e.preventDefault();
    if (!contract || !selected) return;
    setSubmitting(true);
    const toastId = toast.loading(t("retailer", "submitting"));
    try {
      const tx = await contract.deliverItem(
        selected.id,
        form.condition,
        parseInt(form.receivedQty),
        form.remarks
      );
      toast.loading(t("common", "waitConfirm"), { id: toastId });
      await tx.wait();
      toast.success(`✅ Batch #${selected.id} delivered!`, { id: toastId, duration: 5000 });
      setSelected(null);
      setForm({ condition: "Good", receivedQty: "", remarks: "" });
      await fetchBatches();
    } catch (err) {
      toast.error(err.reason || err.message || "Transaction failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="text-center glass-card p-10 max-w-md">
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">{t("retailer", "title")}</h2>
          <p className="text-gray-400 mb-6">{t("retailer", "connectMsg")}</p>
          <button onClick={connectWallet} className="btn-primary">{t("common", "connectWallet")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-xl">🏪</div>
            <h1 className="font-display font-bold text-3xl text-white">{t("retailer", "title")}</h1>
          </div>
          <p className="text-gray-400 text-sm">
            {t("retailer", "subtitle")}
          </p>
        </div>

        {/* In-Transit Batches */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-xl text-white mb-4">
            🚛 {t("retailer", "inTransit")} ({batches.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={32} className="animate-spin text-primary-400" />
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center glass-card p-10">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400">{t("retailer", "noPending")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onAction={(b) => { setSelected(b); setForm({ ...form, receivedQty: String(b.harvest.quantity) }); }}
                  actionLabel={`🏪 ${t("retailer", "actionLabel")}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Delivered Batches */}
        {deliveredBatches.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-4">
              ✅ {t("retailer", "delivered")} ({deliveredBatches.length})
            </h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {deliveredBatches.map((batch) => (
                <div key={batch.id} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-mono">Batch #{batch.id}</p>
                      <h3 className="font-semibold text-white">{batch.harvest.cropName}</h3>
                    </div>
                    <CheckCircle size={20} className="text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    {batch.deliver?.receivedQty} kg · Condition: {batch.deliver?.condition}
                  </p>
                  <button
                    onClick={() => setShowQR(batch.id)}
                    className="w-full btn-primary text-sm py-2"
                  >
                    📱 {t("retailer", "viewQR")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deliver Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 animate-in border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">🏪 {t("retailer", "modalTitle")} #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold text-white">{selected.harvest.cropName}</p>
              <p className="text-xs text-gray-400 mt-1">
                Original: {selected.harvest.quantity} kg · {selected.ship?.origin} → {selected.ship?.destination}
              </p>
            </div>

            <form onSubmit={handleDeliver} className="space-y-4">
              <div>
                <label className="form-label">{t("retailer", "condition")} *</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="input-field"
                >
                  <option value="Good">{t("retailer", "condGood")}</option>
                  <option value="Partial">{t("retailer", "condPartial")}</option>
                  <option value="Damaged">{t("retailer", "condDamaged")}</option>
                </select>
              </div>

              <div>
                <label className="form-label"><span className="flex items-center gap-1"><Package size={12} /> {t("retailer", "receivedQty")} *</span></label>
                <input
                  type="number"
                  min="0"
                  value={form.receivedQty}
                  onChange={(e) => setForm({ ...form, receivedQty: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("retailer", "remarks")}</label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder={t("retailer", "remarksPlaceholder")}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelected(null)} className="btn-secondary flex-1">{t("retailer", "cancel")}</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <><Loader size={16} className="animate-spin" /> {t("retailer", "submitting")}</> : `✅ ${t("retailer", "submit")}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-in">
            <QRCodeDisplay batchId={showQR} />
            <button
              onClick={() => setShowQR(null)}
              className="mt-4 w-full btn-secondary py-2.5"
            >
              {t("common", "cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
