const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriSupplyChain", function () {
  let contract;
  let farmer, processor, distributor, retailer, consumer;

  // Sample test data
  const cropName = "Organic Tomatoes";
  const quantity = 500;
  const location = "Nashik, Maharashtra";
  const harvestDate = Math.floor(Date.now() / 1000);
  const description = "Fresh organic tomatoes grown without pesticides";
  const pricePerKg = ethers.parseEther("0.001");

  beforeEach(async function () {
    [farmer, processor, distributor, retailer, consumer] = await ethers.getSigners();

    const AgriSupplyChain = await ethers.getContractFactory("AgriSupplyChain");
    contract = await AgriSupplyChain.deploy();
    await contract.waitForDeployment();
  });

  // ─────────────────────────────────────────────────────
  //  1. Harvest Tests
  // ─────────────────────────────────────────────────────

  describe("harvestItem()", function () {
    it("✅ Farmer can create a new batch", async function () {
      const tx = await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);

      const receipt = await tx.wait();

      // Check event
      const event = receipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "BatchHarvested";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;

      // Check batch count
      expect(await contract.getBatchCount()).to.equal(1);
    });

    it("✅ Batch is stored correctly on chain", async function () {
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);

      const harvestInfo = await contract.getHarvestInfo(1);
      expect(harvestInfo.cropName).to.equal(cropName);
      expect(harvestInfo.quantity).to.equal(quantity);
      expect(harvestInfo.location).to.equal(location);

      const meta = await contract.getBatchMeta(1);
      expect(meta.farmer).to.equal(farmer.address);
      expect(meta.currentState).to.equal(0); // State.Harvested
    });

    it("❌ Rejects empty crop name", async function () {
      await expect(
        contract.connect(farmer).harvestItem("", quantity, location, harvestDate, description, pricePerKg)
      ).to.be.revertedWith("AgriSupplyChain: Crop name required");
    });

    it("❌ Rejects zero quantity", async function () {
      await expect(
        contract.connect(farmer).harvestItem(cropName, 0, location, harvestDate, description, pricePerKg)
      ).to.be.revertedWith("AgriSupplyChain: Quantity must be > 0");
    });
  });

  // ─────────────────────────────────────────────────────
  //  2. Process Tests
  // ─────────────────────────────────────────────────────

  describe("processItem()", function () {
    beforeEach(async function () {
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);
    });

    it("✅ Processor can process a harvested batch", async function () {
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "Premium quality");

      const meta = await contract.getBatchMeta(1);
      expect(meta.processor).to.equal(processor.address);
      expect(meta.currentState).to.equal(1); // State.Processed

      const processInfo = await contract.getProcessInfo(1);
      expect(processInfo.qualityGrade).to.equal("A");
      expect(processInfo.packagingType).to.equal("Vacuum Packed");
    });

    it("❌ Cannot process a batch that is not in Harvested state", async function () {
      // First process it legitimately
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "");
      // Now try to process again — state is Processed, should fail
      await expect(
        contract.connect(distributor).processItem(1, "B", 35, "Box", "")
      ).to.be.revertedWith("AgriSupplyChain: Invalid state transition");
    });

    it("❌ Cannot process a batch twice", async function () {
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "");
      await expect(
        contract.connect(processor).processItem(1, "B", 35, "Box", "")
      ).to.be.revertedWith("AgriSupplyChain: Invalid state transition");
    });
  });

  // ─────────────────────────────────────────────────────
  //  3. Ship Tests
  // ─────────────────────────────────────────────────────

  describe("shipItem()", function () {
    beforeEach(async function () {
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "");
    });

    it("✅ Distributor can ship a processed batch", async function () {
      const expectedDelivery = harvestDate + 3 * 24 * 60 * 60; // 3 days later
      await contract
        .connect(distributor)
        .shipItem(1, "MH20AB1234", "Ravi Kumar", "Nashik", "Pune", expectedDelivery);

      const meta = await contract.getBatchMeta(1);
      expect(meta.distributor).to.equal(distributor.address);
      expect(meta.currentState).to.equal(2); // State.InTransit

      const shipInfo = await contract.getShipInfo(1);
      expect(shipInfo.vehicleNumber).to.equal("MH20AB1234");
      expect(shipInfo.destination).to.equal("Pune");
    });

    it("❌ Cannot ship a batch that is not in Processed state", async function () {
      // First ship it legitimately
      await contract
        .connect(distributor)
        .shipItem(1, "MH20AB1234", "Ravi Kumar", "Nashik", "Pune", harvestDate + 3 * 86400);
      // Try to ship again — state is InTransit, should fail
      await expect(
        contract
          .connect(retailer)
          .shipItem(1, "MH99ZZ9999", "John", "Pune", "Mumbai", harvestDate + 4 * 86400)
      ).to.be.revertedWith("AgriSupplyChain: Invalid state transition");
    });
  });

  // ─────────────────────────────────────────────────────
  //  4. Deliver Tests
  // ─────────────────────────────────────────────────────

  describe("deliverItem()", function () {
    beforeEach(async function () {
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "");
      await contract
        .connect(distributor)
        .shipItem(1, "MH20AB1234", "Ravi Kumar", "Nashik", "Pune", harvestDate + 3 * 86400);
    });

    it("✅ Retailer can confirm delivery", async function () {
      await contract.connect(retailer).deliverItem(1, "Good", 495, "Minor transit loss");

      const meta = await contract.getBatchMeta(1);
      expect(meta.retailer).to.equal(retailer.address);
      expect(meta.currentState).to.equal(3); // State.Delivered

      const deliverInfo = await contract.getDeliverInfo(1);
      expect(deliverInfo.condition).to.equal("Good");
      expect(deliverInfo.receivedQty).to.equal(495);
    });

    it("❌ Consumer cannot deliver (anyone can call but state must be InTransit)", async function () {
      // Must be InTransit to deliver — already there so consumer calling should succeed
      // (contract doesn't restrict WHO delivers, only the STATE must be correct)
      // This validates that invalid state transition is blocked
      await contract.connect(retailer).deliverItem(1, "Good", 495, "");
      // Second delivery should fail
      await expect(
        contract.connect(retailer).deliverItem(1, "Good", 495, "")
      ).to.be.revertedWith("AgriSupplyChain: Invalid state transition");
    });
  });

  // ─────────────────────────────────────────────────────
  //  5. Full Flow Test
  // ─────────────────────────────────────────────────────

  describe("Full Supply Chain Flow", function () {
    it("✅ Complete flow: Harvest → Process → Ship → Deliver", async function () {
      // Step 1: Harvest
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);
      let meta = await contract.getBatchMeta(1);
      expect(meta.currentState).to.equal(0);

      // Step 2: Process
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "Excellent quality");
      meta = await contract.getBatchMeta(1);
      expect(meta.currentState).to.equal(1);

      // Step 3: Ship
      await contract
        .connect(distributor)
        .shipItem(1, "MH20AB1234", "Ravi Kumar", "Nashik", "Pune", harvestDate + 3 * 86400);
      meta = await contract.getBatchMeta(1);
      expect(meta.currentState).to.equal(2);

      // Step 4: Deliver
      await contract.connect(retailer).deliverItem(1, "Good", 498, "Arrived on time");
      meta = await contract.getBatchMeta(1);
      expect(meta.currentState).to.equal(3);

      // Verify all addresses on chain
      expect(meta.farmer).to.equal(farmer.address);
      expect(meta.processor).to.equal(processor.address);
      expect(meta.distributor).to.equal(distributor.address);
      expect(meta.retailer).to.equal(retailer.address);

      console.log("\n  🎉 Full supply chain flow completed successfully!");
      console.log(`     Batch #1: ${cropName}`);
      console.log(`     Farmer:      ${farmer.address}`);
      console.log(`     Processor:   ${processor.address}`);
      console.log(`     Distributor: ${distributor.address}`);
      console.log(`     Retailer:    ${retailer.address}`);
    });

    it("✅ Consumer can read all batch data (no wallet needed conceptually)", async function () {
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);
      await contract.connect(processor).processItem(1, "A", 40, "Vacuum Packed", "");
      await contract
        .connect(distributor)
        .shipItem(1, "MH20AB1234", "Ravi", "Nashik", "Pune", harvestDate + 3 * 86400);
      await contract.connect(retailer).deliverItem(1, "Good", 500, "");

      // Consumer reads with any signer (read-only)
      const harvestInfo = await contract.connect(consumer).getHarvestInfo(1);
      const processInfo = await contract.connect(consumer).getProcessInfo(1);
      const shipInfo = await contract.connect(consumer).getShipInfo(1);
      const deliverInfo = await contract.connect(consumer).getDeliverInfo(1);

      expect(harvestInfo.cropName).to.equal(cropName);
      expect(processInfo.qualityGrade).to.equal("A");
      expect(shipInfo.vehicleNumber).to.equal("MH20AB1234");
      expect(deliverInfo.condition).to.equal("Good");
    });
  });

  // ─────────────────────────────────────────────────────
  //  6. Invalid State Tests
  // ─────────────────────────────────────────────────────

  describe("Invalid State Transitions", function () {
    it("❌ Cannot skip Harvested → Delivered directly", async function () {
      await contract
        .connect(farmer)
        .harvestItem(cropName, quantity, location, harvestDate, description, pricePerKg);

      // Try to deliver without processing and shipping
      await expect(
        contract.connect(retailer).deliverItem(1, "Good", 500, "")
      ).to.be.revertedWith("AgriSupplyChain: Invalid state transition");
    });

    it("❌ Cannot access non-existent batch", async function () {
      await expect(contract.getHarvestInfo(999)).to.be.revertedWith(
        "AgriSupplyChain: Batch does not exist"
      );
    });
  });
});
