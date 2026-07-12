import React from "react";
import { useLang } from "../context/LanguageContext";
import { formatDate, shortAddress } from "../utils/contract";
import { Check, Circle, Loader } from "lucide-react";

const colorMap = {
  yellow: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    text: "text-yellow-300",
    line: "bg-yellow-500/40",
    icon: "bg-yellow-500",
    glow: "shadow-yellow-500/30",
  },
  blue: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    text: "text-blue-300",
    line: "bg-blue-500/40",
    icon: "bg-blue-500",
    glow: "shadow-blue-500/30",
  },
  orange: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/50",
    text: "text-orange-300",
    line: "bg-orange-500/40",
    icon: "bg-orange-500",
    glow: "shadow-orange-500/30",
  },
  green: {
    bg: "bg-green-500/20",
    border: "border-green-500/50",
    text: "text-green-300",
    line: "bg-green-500/40",
    icon: "bg-green-500",
    glow: "shadow-green-500/30",
  },
};

function StepDetail({ batch, state, t }) {
  if (state === 0 && batch.harvest) {
    return (
      <div className="space-y-1.5 text-sm">
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "crop")}:</span> {batch.harvest.cropName}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "quantity")}:</span> {batch.harvest.quantity} kg
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "location")}:</span> {batch.harvest.location}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "date")}:</span>{" "}
          {formatDate(batch.harvest.harvestDate)}
        </p>
        {batch.harvest.description && (
          <p className="text-gray-400 italic text-xs">{batch.harvest.description}</p>
        )}
        <p className="text-gray-400 font-mono text-xs">
          👤 {shortAddress(batch.farmer)}
        </p>
      </div>
    );
  }
  if (state === 1 && batch.process) {
    return (
      <div className="space-y-1.5 text-sm">
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "quality")}:</span> {batch.process.qualityGrade}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "temp")}:</span> {batch.process.temperature}°C
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "packaging")}:</span> {batch.process.packagingType}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "date")}:</span> {formatDate(batch.process.processDate)}
        </p>
        {batch.process.notes && (
          <p className="text-gray-400 italic text-xs">{batch.process.notes}</p>
        )}
        <p className="text-gray-400 font-mono text-xs">
          👤 {shortAddress(batch.processor)}
        </p>
      </div>
    );
  }
  if (state === 2 && batch.ship) {
    return (
      <div className="space-y-1.5 text-sm">
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "vehicle")}:</span> {batch.ship.vehicleNumber}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "driver")}:</span> {batch.ship.driverName}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "route")}:</span> {batch.ship.origin} → {batch.ship.destination}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "shipped")}:</span> {formatDate(batch.ship.shipDate)}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "expected")}:</span>{" "}
          {formatDate(batch.ship.expectedDelivery)}
        </p>
        <p className="text-gray-400 font-mono text-xs">
          👤 {shortAddress(batch.distributor)}
        </p>
      </div>
    );
  }
  if (state === 3 && batch.deliver) {
    return (
      <div className="space-y-1.5 text-sm">
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "condition")}:</span> {batch.deliver.condition}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "receivedQty")}:</span> {batch.deliver.receivedQty} kg
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">{t("timeline", "arrived")}:</span>{" "}
          {formatDate(batch.deliver.arrivalDate)}
        </p>
        {batch.deliver.remarks && (
          <p className="text-gray-400 italic text-xs">{batch.deliver.remarks}</p>
        )}
        <p className="text-gray-400 font-mono text-xs">
          👤 {shortAddress(batch.retailer)}
        </p>
      </div>
    );
  }
  return <p className="text-gray-500 text-sm italic">{t("timeline", "pending")}</p>;
}

export default function Timeline({ batch }) {
  const { t } = useLang();
  const currentState = batch.state;

  const steps = [
    {
      state: 0,
      label: t("timeline", "harvested"),
      icon: "🌾",
      color: "yellow",
      role: t("timeline", "farmer"),
    },
    {
      state: 1,
      label: t("timeline", "processed"),
      icon: "⚙️",
      color: "blue",
      role: t("timeline", "processor"),
    },
    {
      state: 2,
      label: t("timeline", "inTransit"),
      icon: "🚛",
      color: "orange",
      role: t("timeline", "distributor"),
    },
    {
      state: 3,
      label: t("timeline", "delivered"),
      icon: "🏪",
      color: "green",
      role: t("timeline", "retailer"),
    },
  ];

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isCompleted = currentState > step.state;
        const isCurrent = currentState === step.state;
        const isPending = currentState < step.state;
        const colors = colorMap[step.color];
        const isLast = index === steps.length - 1;

        return (
          <div key={step.state} className="relative flex gap-4 pb-8">
            {/* Vertical line */}
            {!isLast && (
              <div
                className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                  isCompleted ? colors.line : "bg-white/10"
                }`}
              />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                isPending
                  ? "border-white/15 bg-dark-600/50 opacity-40"
                  : isCompleted
                  ? `${colors.icon} border-transparent shadow-lg ${colors.glow}`
                  : `border-current ${colors.text} ${colors.bg} shadow-lg ${colors.glow} animate-pulse-slow`
              }`}
            >
              {isCompleted ? (
                <Check size={16} className="text-white" />
              ) : isCurrent ? (
                <span>{step.icon}</span>
              ) : (
                <Circle size={16} className="text-gray-600" />
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 glass-card p-4 transition-all duration-300 ${
                isPending ? "opacity-40" : ""
              } ${isCurrent ? `border ${colors.border}` : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                    {step.role}
                  </span>
                  <h4 className="text-white font-semibold mt-0.5">{step.label}</h4>
                </div>
                {isCurrent && (
                  <span className={`text-xs ${colors.text} flex items-center gap-1`}>
                    <Loader size={10} className="animate-spin" />
                    {t("timeline", "currentStage")}
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check size={10} />
                    {t("timeline", "verified")}
                  </span>
                )}
              </div>

              <StepDetail batch={batch} state={step.state} t={t} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
