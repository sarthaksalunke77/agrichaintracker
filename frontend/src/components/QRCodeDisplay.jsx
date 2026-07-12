import React, { useState } from "react";
import { useLang } from "../context/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import { buildTrackingUrl } from "../utils/contract";
import { Download, Copy, ExternalLink, QrCode } from "lucide-react";
import toast from "react-hot-toast";

export default function QRCodeDisplay({ batchId }) {
  const { t } = useLang();
  const [size, setSize] = useState(200);
  const url = buildTrackingUrl(batchId);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success(t("qr", "copied"));
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-batch-${batchId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url2 = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = size + 40;
      canvas.height = size + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, size, size);
      const link = document.createElement("a");
      link.download = `batch-${batchId}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url2);
    };
    img.src = url2;
    toast.success(t("qr", "downloaded"));
  };

  return (
    <div className="glass-card p-6 text-center">
      <div className="flex items-center gap-2 justify-center mb-4">
        <QrCode size={18} className="text-primary-400" />
        <h3 className="font-display font-bold text-white">{t("qr", "title")}</h3>
      </div>

      <p className="text-gray-400 text-sm mb-5">
        {t("qr", "subtitle")} #{batchId}
      </p>

      {/* QR Code */}
      <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl mb-5 qr-wrapper">
        <QRCodeSVG
          id={`qr-batch-${batchId}`}
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/favicon.svg",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      {/* URL display */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-500/50 rounded-xl border border-white/10 mb-4 text-left">
        <span className="text-xs font-mono text-gray-400 truncate flex-1">{url}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={copyLink} className="btn-secondary flex-1 text-sm py-2">
          <Copy size={14} />
          {t("qr", "copyLink")}
        </button>
        <button onClick={downloadQR} className="btn-primary flex-1 text-sm py-2">
          <Download size={14} />
          {t("qr", "download")}
        </button>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-primary-400 transition-colors"
      >
        <ExternalLink size={11} />
        {t("qr", "open")}
      </a>
    </div>
  );
}
