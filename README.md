# 🌾 Agri Chain Tracker: A Blockchain-Based Agricultural Supply Chain Tracking System

**Farm-to-Fork Supply Chain Tracker**
*Ensuring Transparency, Traceability, and Trust from Farm to Consumer.*

---

## 📖 Abstract

Agriculture is one of the most important sectors of the economy, but farmers and consumers often face issues such as fake products, poor traceability, delayed payments, and lack of transparency. Consumers usually do not know where their food comes from, while farmers struggle to prove the quality and authenticity of their produce.

**Agri Chain Tracker** is a web-based system that digitally records every stage of the agricultural supply chain—from the farmer to the consumer. Each product batch is assigned a unique QR code, allowing anyone to trace its journey. The system stores details such as crop information, harvesting, transportation, storage, processing, and retail history. **Blockchain technology is integrated** to ensure records cannot be altered.

This project improves transparency, builds consumer trust, reduces fraud, and helps farmers receive fair recognition for quality products.

---

## 🚨 Problem Statement

Current agricultural supply chains face several challenges:
* Lack of product traceability
* Fake organic products
* Poor transparency
* Food safety concerns
* Manual record keeping
* Difficulty identifying the source of contamination
* Farmers receive low profits due to multiple intermediaries
* Consumers cannot verify product authenticity

---

## 💡 Proposed Solution

Develop a digital tracking system where every agricultural product receives a unique Batch ID and QR Code. Whenever the product moves through the supply chain, the responsible stakeholder updates the product status on the immutable blockchain.

Consumers can simply scan the QR code and view:
* Farmer details
* Crop information
* Harvest date
* Warehouse & Processing history
* Transportation details
* Quality inspection
* Retail information

---

## 🎯 Objectives

* Digitize agricultural supply chain management
* Improve transparency and track products from farm to customer
* Prevent fraud and improve food safety
* Help farmers showcase authentic products
* Reduce paperwork and enable real-time monitoring

---

## 🏗️ System Architecture

```text
Farmer Portal
      │
      ▼
Crop Registration (Blockchain Mint)
      │
      ▼
QR Code Generation
      │
      ▼
Processing Unit / Warehouse Module
      │
      ▼
Transportation Module
      │
      ▼
Retail Store Module
      │
      ▼
Consumer QR Scan
      │
      ▼
Product History Display (Verified by Smart Contract)
```

---

## 💻 Technology Stack

### Frontend
* **React.js (Vite)**
* **Tailwind CSS** for modern UI design
* **Lucide React** for icons
* **React Router** for navigation

### Backend & Blockchain
* **Solidity** (Smart Contracts)
* **Hardhat** (Local Blockchain Node & Testing)
* **Ethers.js** (Web3 integration connecting React to Blockchain)

### Tools
* **VS Code**
* **MetaMask** (Crypto Wallet for Authentication & Transactions)
* **Git & GitHub**

---

## 🚀 Features Built (Mini Project Outcome)

This project demonstrates a working decentralized application (DApp) where:
1. **Farmers** register their produce and generate a QR code for each batch.
2. **Processors, Transporters, and Retailers** update the product's status through role-specific dashboards.
3. **Consumers** scan the QR code to view the complete, tamper-proof journey of the product from farm to store.
4. **Bilingual Support**: The entire application is available in both **English and Marathi** to ensure accessibility for local farmers.

This project is ideal for a **B.Tech mini project** because it demonstrates full-stack web3 development, smart contract design, QR code integration, state-machine tracking, and practical supply chain management, while remaining achievable within a single semester.
