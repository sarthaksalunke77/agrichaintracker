import React from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useLang } from "../context/LanguageContext";
import { Leaf, Shield, Zap, Eye, ArrowRight, Wallet, ChevronDown } from "lucide-react";

export default function Home() {
  const { isConnected, connectWallet, isConnecting } = useWeb3();
  const { t, lang } = useLang();

  const features = [
    {
      icon: Shield,
      title: t("home", "feature1Title"),
      desc: t("home", "feature1Desc"),
      color: "text-primary-400",
      bg: "bg-primary-500/10",
      border: "border-primary-500/20",
    },
    {
      icon: Eye,
      title: t("home", "feature2Title"),
      desc: t("home", "feature2Desc"),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Zap,
      title: t("home", "feature3Title"),
      desc: t("home", "feature3Desc"),
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
  ];

  const roles = [
    { icon: "🌾", label: t("nav", "farmer"), path: "/farmer", desc: t("home", "rolesFarmerDesc"), color: "from-green-600 to-emerald-500" },
    { icon: "⚙️", label: t("nav", "processor"), path: "/processor", desc: t("home", "rolesProcessorDesc"), color: "from-blue-600 to-cyan-500" },
    { icon: "🚛", label: t("nav", "distributor"), path: "/distributor", desc: t("home", "rolesDistributorDesc"), color: "from-orange-600 to-amber-500" },
    { icon: "🏪", label: t("nav", "retailer"), path: "/retailer", desc: t("home", "rolesRetailerDesc"), color: "from-purple-600 to-violet-500" },
    { icon: "📦", label: t("nav", "consumer"), path: "/consumer", desc: t("home", "rolesConsumerDesc"), color: "from-pink-600 to-rose-500" },
  ];

  const flowSteps = [
    { icon: "🌾", label: t("home", "flow1"), sub: t("home", "flow1sub") },
    { icon: "⚙️", label: t("home", "flow2"), sub: t("home", "flow2sub") },
    { icon: "🚛", label: t("home", "flow3"), sub: t("home", "flow3sub") },
    { icon: "🏪", label: t("home", "flow4"), sub: t("home", "flow4sub") },
    { icon: "📱", label: t("home", "flow5"), sub: t("home", "flow5sub") },
  ];

  return (
    <div className="min-h-screen blockchain-bg">
      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-600/8 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-40 right-1/3 w-60 h-60 bg-blue-600/6 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-300 text-sm font-medium mb-8 animate-in">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            {t("home", "badge")}
          </div>

          {/* Dual Language Headline */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-4 animate-in">
            {t("home", "title1")}
            <br />
            <span className="text-gradient">{t("home", "title2")}</span>
            <br />
            {t("home", "title3")}
          </h1>

          {/* Marathi subtitle line */}
          {lang === "en" && (
            <p className="text-sm text-primary-400/60 font-medium mb-2 tracking-wide">
              शेतातून थेट · पुरवठा साखळी ट्रॅकर
            </p>
          )}
          {lang === "mr" && (
            <p className="text-sm text-primary-400/60 font-medium mb-2 tracking-wide">
              Farm-to-Fork · Supply Chain Tracker
            </p>
          )}

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in">
            <span className="text-primary-300 font-semibold">{t("home", "tagline1")}</span>,{" "}
            <span className="text-emerald-300 font-semibold">{t("home", "tagline2")}</span>{" "}
            {lang === "en" ? "and" : "आणि"}{" "}
            <span className="text-green-300 font-semibold">{t("home", "tagline3")}</span>.{" "}
            {lang === "en"
              ? "Every stage recorded permanently on blockchain."
              : "प्रत्येक टप्पा Blockchain वर कायमचा नोंदवला जातो."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-in">
            {!isConnected ? (
              <button onClick={connectWallet} disabled={isConnecting} className="btn-primary text-base px-8 py-4">
                <Wallet size={18} />
                {isConnecting ? t("nav", "connecting") : t("nav", "connect")}
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link to="/farmer" className="btn-primary text-base px-8 py-4">
                <Leaf size={18} />
                {t("home", "ctaOpen")}
                <ArrowRight size={16} />
              </Link>
            )}
            <Link to="/consumer" className="btn-secondary text-base px-8 py-4">
              <Eye size={18} />
              {t("home", "ctaTrack")}
            </Link>
          </div>

          <div className="mt-16 animate-bounce-slow">
            <ChevronDown size={20} className="text-gray-600 mx-auto" />
          </div>
        </div>
      </section>

      {/* ── Supply Chain Flow ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-3">{t("home", "howTitle")}</h2>
            <p className="text-gray-400">{t("home", "howSub")}</p>
          </div>
          <div className="relative flex flex-wrap items-center justify-center gap-0">
            {flowSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center w-28">
                  <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-2xl mb-3 hover-lift cursor-default">
                    {step.icon}
                  </div>
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.sub}</p>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="flex items-center pb-8">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-primary-600/50 to-primary-400/20 mx-1" />
                    <ArrowRight size={14} className="text-primary-500/50" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-3">{t("home", "whyTitle")}</h2>
            <p className="text-gray-400 max-w-xl mx-auto">{t("home", "whySub")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`glass-card-hover p-6 border ${f.border}`}>
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-3">{t("home", "rolesTitle")}</h2>
            <p className="text-gray-400">{t("home", "rolesSub")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((role) => (
              <Link key={role.label} to={role.path} className="glass-card-hover p-5 text-center group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  {role.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{role.label}</h3>
                <p className="text-xs text-gray-500">{role.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "4", label: t("home", "statsStages") },
              { val: "5", label: t("home", "statsRoles") },
              { val: "100%", label: t("home", "statsTamper") },
              { val: "0", label: t("home", "statsFailure") },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display font-black text-4xl text-gradient mb-1">{stat.val}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf size={16} className="text-primary-400" />
            <span className="font-display font-bold text-white text-sm">
              {lang === "mr" ? "शेत-ते-काटा Blockchain ट्रॅकर" : "Farm-to-Fork Blockchain Tracker"}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {lang === "mr"
              ? "मिनी प्रकल्प · Solidity, Hardhat, React, Ethers.js · Ethereum Blockchain"
              : "Mini Project · Built with Solidity, Hardhat, React, Ethers.js · Ethereum Blockchain"}
          </p>
        </div>
      </footer>
    </div>
  );
}
