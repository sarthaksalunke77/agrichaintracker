# Mini Project: AgriChain Tracker
### Blockchain-Based Agriculture Supply Chain Tracking System

## 1. Project Title
**AgriChain Tracker: Blockchain-Based Food Supply Chain Tracking System**

---

## 2. Abstract
AgriChain Tracker is a blockchain-based web application that maintains transparent and secure records of agricultural products throughout the supply chain. Every participant—including farmers, distributors, manufacturers, retailers, and consumers—can access trusted information about the product.

The system records each stage on the blockchain, preventing data tampering. Consumers can scan a QR code to verify product authenticity, origin, and journey.

---

## 3. Problem Statement
Traditional agricultural supply chains face several challenges:
* Food fraud
* Fake organic labels
* No product traceability
* Data manipulation
* Lack of transparency
* Difficult recall management

The project solves these issues using blockchain technology.

---

## 4. Objectives
* Track agricultural products from farm to consumer.
* Prevent fake food products.
* Ensure data transparency.
* Provide product verification using QR codes.
* Build trust between farmers and consumers.

---

## 5. Modules

### Module 1: Farmer Registration
Functions:
* Farmer Login
* Add Farm Details
* Add Crop Information
* Harvest Date
* Organic Certificate Upload
* Location Details

Stored Data:
```
Farmer ID | Farmer Name | Crop | Farm Location | Harvest Date | Certificate
```

### Module 2: Supplier Module
Supplier receives products from farmers.
Functions:
* Accept Product
* Quality Inspection
* Store Warehouse Information
* Transportation Details

Stored on Blockchain:
```
Supplier Name | Temperature | Humidity | Arrival Date
```

### Module 3: Distribution Module
Distributor transports products.
Functions:
* Vehicle Details
* Driver Details
* Route
* Delivery Status

IoT Sensors: GPS, Temperature, Humidity

Blockchain stores:
```
Vehicle Number | Current Location | Delivery Time
```

### Module 4: Production Module
Manufacturer processes raw products. (e.g., Milk → Cheese, Tomato → Sauce, Wheat → Flour)
Functions:
* Batch Number
* Processing Date
* Packaging Date
* Expiry Date

### Module 5: Retail Module
Retail shop receives products.
Functions:
* Receive Stock
* Verify Blockchain Data
* Generate QR Code

### Module 6: Consumer Module
Consumer scans QR Code.
Displays:
```
Farmer Name | Farm Location | Harvest Date | Transport Details | Storage Temperature | Processing Date | Expiry Date | Blockchain Transaction ID
```

---

## 6. System Architecture
```
Farmer
   │
   ▼
Supplier
   │
   ▼
Distributor
   │
   ▼
Manufacturer
   │
   ▼
Retail Shop
   │
   ▼
Consumer
         │
         ▼
 Blockchain Network
```
Every transaction is permanently stored in blockchain.

---

## 7. Workflow
```
Farmer Harvests Crop
         │
         ▼
Farmer Uploads Details
         │
         ▼
Blockchain Transaction Created
         │
         ▼
Supplier Receives Product
         │
         ▼
Distributor Updates Shipment
         │
         ▼
Manufacturer Processes Product
         │
         ▼
Retailer Generates QR Code
         │
         ▼
Consumer Scans QR Code
         │
         ▼
Complete Product History Displayed
```

---

## 8. Technology Stack
* **Frontend:** HTML, CSS, Bootstrap, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Blockchain:** Ethereum, Ganache (Local Blockchain), Solidity Smart Contracts, MetaMask
* **QR Code:** qrcode.js
* **Optional IoT:** ESP32, DHT11 Temperature Sensor, GPS Module

---

## 9. Database Tables
* **Farmer:** FarmerID, Name, Village, Crop, HarvestDate, Certificate
* **Supplier:** SupplierID, ProductID, QualityStatus, Warehouse
* **Distributor:** VehicleID, GPS, Temperature, DeliveryStatus
* **Manufacturer:** BatchNo, ProcessDate, PackagingDate, ExpiryDate
* **Retail:** RetailID, Stock, QRCode

---

## 10. Smart Contract Functions
`registerFarmer()`, `addSupplier()`, `addDistributor()`, `addManufacturer()`, `addRetailer()`, `getProductHistory()`, `verifyProduct()`, `generateQRCode()`

---

## 11. QR Code Information
QR contains: Product ID, Blockchain Hash, Batch Number, Verification URL
Example: `AGRI20260001` | Hash: `0x9A234D12B....`

---

## 12. User Roles
Admin, Farmer, Supplier, Distributor, Manufacturer, Retailer, Consumer

---

## 13. Features
* Blockchain Security & Immutable Records
* QR Code Verification
* Farmer Authentication
* Product Traceability
* Smart Contracts & Transaction History
* Real-Time Supply Tracking
* Consumer Verification & Audit Trail

---

## 14. Advantages
* Prevents food fraud & builds customer trust
* Improves transparency & reduces counterfeit products
* Fast product recall & better inventory management
* Secure record keeping

---

## 15. Future Scope
* AI-based quality prediction
* IoT sensor integration & drone crop monitoring
* Mobile application
* RFID tracking
* Digital payment integration
* Carbon footprint tracking & export compliance

---

## 16. Expected Output
1. Farmer registers a product.
2. Blockchain creates an immutable transaction.
3. Supplier updates the shipment details.
4. Distributor records transportation information.
5. Manufacturer logs processing and packaging.
6. Retailer generates a QR code for the product.
7. Consumer scans the QR code to view the complete supply chain history, ensuring the product is authentic and traceable.

This mini project is well-suited for a B.Tech Blockchain Technology course because it demonstrates practical use of Ethereum smart contracts, QR code verification, web development, and supply chain traceability while remaining manageable within a semester.
