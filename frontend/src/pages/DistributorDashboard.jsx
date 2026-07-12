import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useLang } from "../context/LanguageContext";
import { fetchAllBatches } from "../utils/contract";
import BatchCard from "../components/BatchCard";
import { X, Loader, Truck, User, MapPin, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function DistributorDashboard() {
  const { contract, isConnected, connectWallet } = useWeb3();
  const { t } = useLang();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    vehicleNumber: "",
    driverName: "",
    origin: "",
    destination: "",
    expectedDelivery: "",
  });

  const fetchBatches = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const all = await fetchAllBatches(contract);
      setBatches(all.filter((b) => b.state === 1)); // Only Processed
    } catch (err) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, [contract]);

  const handleShip = async (e) => {
    e.preventDefault();
    if (!contract || !selected) return;
    setSubmitting(true);
    const toastId = toast.loading(t("distributor", "submitting"));
    try {
      const expectedTimestamp = Math.floor(new Date(form.expectedDelivery).getTime() / 1000);
      const tx = await contract.shipItem(
        selected.id,
        form.vehicleNumber,
        form.driverName,
        form.origin,
        form.destination,
        expectedTimestamp
      );
      toast.loading(t("common", "waitConfirm"), { id: toastId });
      await tx.wait();
      toast.success(`✅ Batch #${selected.id} shipped!`, { id: toastId, duration: 5000 });
      setSelected(null);
      setForm({ vehicleNumber: "", driverName: "", origin: "", destination: "", expectedDelivery: "" });
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
          <div className="text-5xl mb-4">🚛</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">{t("distributor", "title")}</h2>
          <p className="text-gray-400 mb-6">{t("distributor", "connectMsg")}</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-xl">🚛</div>
            <h1 className="font-display font-bold text-3xl text-white">{t("distributor", "title")}</h1>
          </div>
          <p className="text-gray-400 text-sm">
            {t("distributor", "subtitle")}
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-8">
          <span className="text-orange-400 mt-0.5">ℹ️</span>
          <div className="text-sm text-orange-300">
            {t("distributor", "info")}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size={32} className="animate-spin text-primary-400" />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center glass-card p-16">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">{t("distributor", "noPending")}</h3>
            <p className="text-gray-400">{t("distributor", "noPendingSub")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onAction={(b) => setSelected(b)}
                actionLabel={`🚛 ${t("distributor", "actionLabel")}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ship Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 animate-in border border-orange-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">🚛 {t("distributor", "modalTitle")} #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold text-white">{selected.harvest.cropName} — {selected.harvest.quantity} kg</p>
              {selected.process && (
                <p className="text-xs text-gray-400 mt-1">
                  Grade: {selected.process.qualityGrade} · {selected.process.packagingType}
                </p>
              )}
            </div>

            <form onSubmit={handleShip} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label"><span className="flex items-center gap-1"><Truck size={12} /> {t("distributor", "vehicle")} *</span></label>
                  <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    placeholder={t("distributor", "vehiclePlaceholder")} className="input-field" required />
                </div>
                <div>
                  <label className="form-label"><span className="flex items-center gap-1"><User size={12} /> {t("distributor", "driver")} *</span></label>
                  <input value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                    placeholder={t("distributor", "driverPlaceholder")} className="input-field" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label"><span className="flex items-center gap-1"><MapPin size={12} /> {t("distributor", "origin")} *</span></label>
                  <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    placeholder={t("distributor", "originPlaceholder")} className="input-field" required />
                </div>
                <div>
                  <label className="form-label"><span className="flex items-center gap-1"><MapPin size={12} /> {t("distributor", "destination")} *</span></label>
                  <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder={t("distributor", "destinationPlaceholder")} className="input-field" required />
                </div>
              </div>

              <div>
                <label className="form-label"><span className="flex items-center gap-1"><Calendar size={12} /> {t("distributor", "expectedDelivery")} *</span></label>
                <input type="date" value={form.expectedDelivery}
                  onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
                  className="input-field" required />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelected(null)} className="btn-secondary flex-1">{t("distributor", "cancel")}</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <><Loader size={16} className="animate-spin" /> {t("distributor", "submitting")}</> : `🚛 ${t("distributor", "submit")}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
