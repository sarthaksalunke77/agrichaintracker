import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { formatDate, shortAddress } from "../utils/contract";
import StepBadge from "./StepBadge";
import { MapPin, Package, Calendar, User, ChevronRight, Hash } from "lucide-react";

export default function BatchCard({ batch, onAction, actionLabel, actionDisabled }) {
  const { t } = useLang();

  return (
    <div className="glass-card-hover p-5 group relative overflow-hidden">
      {/* Subtle corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:bg-primary-500/10 transition-colors" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
              <Hash size={10} />
              {t("batchCard", "batch")} {batch.id}
            </span>
          </div>
          <h3 className="text-lg font-display font-bold text-white">
            {batch.harvest.cropName}
          </h3>
        </div>
        <StepBadge state={batch.state} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin size={13} className="text-primary-400 shrink-0" />
          <span className="truncate">{batch.harvest.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Package size={13} className="text-primary-400 shrink-0" />
          <span>{batch.harvest.quantity} kg</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={13} className="text-primary-400 shrink-0" />
          <span>{formatDate(batch.harvest.harvestDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User size={13} className="text-primary-400 shrink-0" />
          <span className="font-mono text-xs">{shortAddress(batch.farmer)}</span>
        </div>
      </div>

      {/* Process info if available */}
      {batch.process && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <span className="text-xs text-blue-300">
            Grade: <strong>{batch.process.qualityGrade}</strong>
          </span>
          <span className="text-gray-600">·</span>
          <span className="text-xs text-blue-300">{batch.process.packagingType}</span>
        </div>
      )}

      {/* Ship info if available */}
      {batch.ship && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <span className="text-xs text-orange-300">
            🚛 {batch.ship.origin} → {batch.ship.destination}
          </span>
          <span className="text-gray-600">·</span>
          <span className="text-xs text-orange-300">{batch.ship.vehicleNumber}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <Link
          to={`/track/${batch.id}`}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 transition-colors"
        >
          {t("batchCard", "viewTimeline")}
          <ChevronRight size={12} />
        </Link>

        {onAction && (
          <button
            onClick={() => onAction(batch)}
            disabled={actionDisabled}
            className="btn-primary text-xs py-1.5 px-4"
          >
            {actionLabel || "Take Action"}
          </button>
        )}
      </div>
    </div>
  );
}
