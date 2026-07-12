import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./context/Web3Context";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FarmerDashboard from "./pages/FarmerDashboard";
import ProcessorDashboard from "./pages/ProcessorDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import ConsumerPage from "./pages/ConsumerPage";
import TrackBatch from "./pages/TrackBatch";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 pt-24">
      <div className="glass-card p-12 max-w-md">
        <div className="text-7xl mb-4">🌿</div>
        <h1 className="font-display font-black text-4xl text-white mb-2">404</h1>
        <p className="text-gray-400 mb-6">This page doesn't exist in our supply chain!</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Web3Provider>
        <BrowserRouter>
        <div className="min-h-screen">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/processor" element={<ProcessorDashboard />} />
            <Route path="/distributor" element={<DistributorDashboard />} />
            <Route path="/retailer" element={<RetailerDashboard />} />
            <Route path="/consumer" element={<ConsumerPage />} />
            <Route path="/track/:batchId" element={<TrackBatch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster
            position="bottom-right"
            gutter={8}
            toastOptions={{
              style: {
                background: "#111827",
                color: "#f1f5f9",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#111827",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#111827",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#111827",
                },
              },
            }}
          />
        </div>
        </BrowserRouter>
      </Web3Provider>
    </LanguageProvider>
  );
}
