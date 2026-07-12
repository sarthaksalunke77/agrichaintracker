import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useLang } from "../context/LanguageContext";
import { fetchAllBatches, formatDate } from "../utils/contract";
import BatchCard from "../components/BatchCard";
import { Leaf, Plus, Package, Hash, MapPin, Calendar, Coins, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function FarmerDashboard() {
  const { contract, isConnected, account, connectWallet } = useWeb3();
  const { t } = useLang();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    location: "",
    harvestDate: "",
    description: "",
    pricePerKg: "",
  });

  const fetchBatches = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const all = await fetchAllBatches(contract);
      // Show only batches created by this farmer
      const mine = all.filter(
        (b) => b.farmer.toLowerCase() === account?.toLowerCase()
      );
      setBatches(mine);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [contract, account]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error(t("common", "connectWallet"));

    const { cropName, quantity, location, harvestDate, description, pricePerKg } = form;
    if (!cropName || !quantity || !location || !harvestDate || !pricePerKg) {
      return toast.error(t("farmer", "fillAll"));
    }

    setSubmitting(true);
    const toastId = toast.loading(t("farmer", "creating"));
    try {
      const { ethers } = await import("ethers");
      const harvestTimestamp = Math.floor(new Date(harvestDate).getTime() / 1000);
      const priceWei = ethers.parseEther(pricePerKg);

      const tx = await contract.harvestItem(
        cropName,
        parseInt(quantity),
        location,
        harvestTimestamp,
        description,
        priceWei
      );

      toast.loading(t("farmer", "waiting"), { id: toastId });
      await tx.wait();

      toast.success(`✅ ${t("farmer", "success")} Tx: ${tx.hash.slice(0, 10)}...`, {
        id: toastId,
        duration: 5000,
      });

      setForm({ cropName: "", quantity: "", location: "", harvestDate: "", description: "", pricePerKg: "" });
      setShowForm(false);
      await fetchBatches();
    } catch (err) {
      console.error(err);
      toast.error(err.reason || err.message || "Transaction failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="text-center glass-card p-10 max-w-md">
          <div className="text-5xl mb-4">🌾</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">{t("farmer", "title")}</h2>
          <p className="text-gray-400 mb-6">{t("farmer", "connectMsg")}</p>
          <button onClick={connectWallet} className="btn-primary">
            {t("common", "connectWallet")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-xl">
                🌾
              </div>
              <h1 className="font-display font-bold text-3xl text-white">{t("farmer", "title")}</h1>
            </div>
            <p className="text-gray-400 text-sm ml-13">
              {t("farmer", "subtitle")}
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={16} />
            {t("farmer", "newBatch")}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("farmer", "myBatches"), val: batches.length, icon: Package },
            { label: t("farmer", "harvested"), val: batches.filter((b) => b.state === 0).length, icon: Leaf },
            { label: t("farmer", "processed"), val: batches.filter((b) => b.state >= 1).length, icon: Package },
            { label: t("farmer", "delivered"), val: batches.filter((b) => b.state === 3).length, icon: Package },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-3xl font-display font-black text-gradient mb-1">{s.val}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Batch Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size={32} className="animate-spin text-primary-400" />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center glass-card p-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">{t("farmer", "noBatches")}</h3>
            <p className="text-gray-400 mb-6">
              {t("farmer", "noBatchesSub")}
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={16} />
              {t("farmer", "createFirst")}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>

      {/* ── Create Batch Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">🌾 {t("farmer", "modalTitle")}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">{t("farmer", "cropName")} *</label>
                <input
                  name="cropName"
                  value={form.cropName}
                  onChange={handleChange}
                  placeholder={t("farmer", "cropPlaceholder")}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    <span className="flex items-center gap-1">
                      <Package size={12} /> {t("farmer", "quantity")} *
                    </span>
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="500"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">
                    <span className="flex items-center gap-1">
                      <Coins size={12} /> {t("farmer", "pricePerKg")} *
                    </span>
                  </label>
                  <input
                    name="pricePerKg"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.pricePerKg}
                    onChange={handleChange}
                    placeholder="0.001"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {t("farmer", "location")} *
                  </span>
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder={t("farmer", "locationPlaceholder")}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {t("farmer", "harvestDate")} *
                  </span>
                </label>
                <input
                  name="harvestDate"
                  type="date"
                  value={form.harvestDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("farmer", "description")}</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder={t("farmer", "descPlaceholder")}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  {t("farmer", "cancel")}
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" /> {t("farmer", "submitting")}
                    </>
                  ) : (
                    <>
                      <Leaf size={16} /> {t("farmer", "submit")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
