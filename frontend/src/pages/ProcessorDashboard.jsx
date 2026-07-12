import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useLang } from "../context/LanguageContext";
import { fetchAllBatches } from "../utils/contract";
import BatchCard from "../components/BatchCard";
import { X, Loader, Star, Thermometer, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function ProcessorDashboard() {
  const { contract, isConnected, connectWallet } = useWeb3();
  const { t } = useLang();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    qualityGrade: "A",
    temperature: "4",
    packagingType: "",
    notes: "",
  });

  const fetchBatches = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const all = await fetchAllBatches(contract);
      setBatches(all.filter((b) => b.state === 0)); // Only Harvested
    } catch (err) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, [contract]);

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!contract || !selected) return;
    setSubmitting(true);
    const toastId = toast.loading(t("processor", "submitting"));
    try {
      const tx = await contract.processItem(
        selected.id,
        form.qualityGrade,
        parseInt(form.temperature),
        form.packagingType,
        form.notes
      );
      toast.loading(t("common", "waitConfirm"), { id: toastId });
      await tx.wait();
      toast.success(`✅ Batch #${selected.id} processed!`, { id: toastId, duration: 5000 });
      setSelected(null);
      setForm({ qualityGrade: "A", temperature: "4", packagingType: "", notes: "" });
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
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">{t("processor", "title")}</h2>
          <p className="text-gray-400 mb-6">{t("processor", "connectMsg")}</p>
          <button onClick={connectWallet} className="btn-primary">{t("common", "connectWallet")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-xl">⚙️</div>
            <h1 className="font-display font-bold text-3xl text-white">{t("processor", "title")}</h1>
          </div>
          <p className="text-gray-400 text-sm ml-13">
            {t("processor", "subtitle")}
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-8">
          <span className="text-blue-400 mt-0.5">ℹ️</span>
          <div className="text-sm text-blue-300">
            {t("processor", "info")}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size={32} className="animate-spin text-primary-400" />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center glass-card p-16">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">{t("processor", "noPending")}</h3>
            <p className="text-gray-400">{t("processor", "noPendingSub")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onAction={(b) => setSelected(b)}
                actionLabel={`⚙️ ${t("processor", "actionLabel")}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Process Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 animate-in border border-blue-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">
                ⚙️ {t("processor", "modalTitle")} #{selected.id}
              </h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">{t("processor", "processing")}</p>
              <p className="font-semibold text-white">{selected.harvest.cropName} — {selected.harvest.quantity} kg</p>
              <p className="text-xs text-gray-500">📍 {selected.harvest.location}</p>
            </div>

            <form onSubmit={handleProcess} className="space-y-4">
              <div>
                <label className="form-label">
                  <span className="flex items-center gap-1"><Star size={12} /> {t("processor", "qualityGrade")} *</span>
                </label>
                <select
                  value={form.qualityGrade}
                  onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                  className="input-field"
                >
                  <option value="A">{t("processor", "gradeA")}</option>
                  <option value="B">{t("processor", "gradeB")}</option>
                  <option value="C">{t("processor", "gradeC")}</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  <span className="flex items-center gap-1"><Thermometer size={12} /> {t("processor", "temperature")} *</span>
                </label>
                <input
                  type="number"
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                  placeholder="4"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  <span className="flex items-center gap-1"><Package size={12} /> {t("processor", "packaging")} *</span>
                </label>
                <input
                  value={form.packagingType}
                  onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                  placeholder={t("processor", "packagingPlaceholder")}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("processor", "notes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("processor", "notesPlaceholder")}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelected(null)} className="btn-secondary flex-1">{t("processor", "cancel")}</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <><Loader size={16} className="animate-spin" /> {t("processor", "submitting")}</> : `⚙️ ${t("processor", "submit")}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
