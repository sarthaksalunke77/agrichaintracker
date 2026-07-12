import React from "react";
import { useLang } from "../context/LanguageContext";

export default function StepBadge({ state, size = "sm" }) {
  const { t } = useLang();

  const configs = {
    0: {
      label: t("timeline", "harvested"),
      icon: "🌾",
      classes: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
      dot: "bg-yellow-400",
    },
    1: {
      label: t("timeline", "processed"),
      icon: "⚙️",
      classes: "bg-blue-500/15 text-blue-300 border-blue-500/40",
      dot: "bg-blue-400",
    },
    2: {
      label: t("timeline", "inTransit"),
      icon: "🚛",
      classes: "bg-orange-500/15 text-orange-300 border-orange-500/40",
      dot: "bg-orange-400",
    },
    3: {
      label: t("timeline", "delivered"),
      icon: "🏪",
      classes: "bg-green-500/15 text-green-300 border-green-500/40",
      dot: "bg-green-400",
    },
  };

  const cfg = configs[state] || configs[0];
  const sizeClass = size === "lg" ? "px-4 py-2 text-sm gap-2" : "px-3 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${cfg.classes} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
      {cfg.icon} {cfg.label}
    </span>
  );
}
