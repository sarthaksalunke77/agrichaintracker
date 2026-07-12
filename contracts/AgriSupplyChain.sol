// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgriSupplyChain
 * @dev Farm-to-Fork Supply Chain Tracker
 * Tracks agricultural product batches through Harvest → Process → Ship → Deliver
 */
contract AgriSupplyChain {
    // ─────────────────────────────────────────────
    //  Enums & Structs
    // ─────────────────────────────────────────────

    enum State {
        Harvested,   // 0 — Farmer creates batch
        Processed,   // 1 — Processor updates quality/packaging
        InTransit,   // 2 — Distributor ships
        Delivered    // 3 — Retailer confirms receipt
    }

    struct HarvestInfo {
        string cropName;
        uint256 quantity;       // in kg
        string location;
        uint256 harvestDate;    // Unix timestamp
        string description;
        uint256 pricePerKg;     // in wei
    }

    struct ProcessInfo {
        string qualityGrade;   // A, B, C
        int256 temperature;    // in Celsius (stored x10 to avoid decimals)
        string packagingType;
        uint256 processDate;
        string notes;
    }

    struct ShipInfo {
        string vehicleNumber;
        string driverName;
        string origin;
        string destination;
        uint256 shipDate;
        uint256 expectedDelivery;
    }

    struct DeliverInfo {
        uint256 arrivalDate;
        string condition;       // Good, Damaged, Partial
        uint256 receivedQty;
        string remarks;
    }

    struct Batch {
        uint256 id;
        HarvestInfo harvest;
        ProcessInfo process;
        ShipInfo ship;
        DeliverInfo deliver;
        address farmer;
        address processor;
        address distributor;
        address retailer;
        State currentState;
        bool exists;
    }

    // ─────────────────────────────────────────────
    //  State Variables
    // ─────────────────────────────────────────────

    uint256 private _batchCounter;
    mapping(uint256 => Batch) private _batches;
    uint256[] private _batchIds;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event BatchHarvested(uint256 indexed batchId, address indexed farmer, string cropName, uint256 timestamp);
    event BatchProcessed(uint256 indexed batchId, address indexed processor, string qualityGrade, uint256 timestamp);
    event BatchShipped(uint256 indexed batchId, address indexed distributor, string vehicleNumber, uint256 timestamp);
    event BatchDelivered(uint256 indexed batchId, address indexed retailer, string condition, uint256 timestamp);

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier batchExists(uint256 batchId) {
        require(_batches[batchId].exists, "AgriSupplyChain: Batch does not exist");
        _;
    }

    modifier onlyFarmerOf(uint256 batchId) {
        require(
            msg.sender == _batches[batchId].farmer,
            "AgriSupplyChain: Only the original farmer can call this"
        );
        _;
    }

    modifier inState(uint256 batchId, State expectedState) {
        require(
            _batches[batchId].currentState == expectedState,
            "AgriSupplyChain: Invalid state transition"
        );
        _;
    }

    // ─────────────────────────────────────────────
    //  Core Functions
    // ─────────────────────────────────────────────

    /**
     * @dev Farmer creates a new product batch
     */
    function harvestItem(
        string calldata cropName,
        uint256 quantity,
        string calldata location,
        uint256 harvestDate,
        string calldata description,
        uint256 pricePerKg
    ) external returns (uint256) {
        require(bytes(cropName).length > 0, "AgriSupplyChain: Crop name required");
        require(quantity > 0, "AgriSupplyChain: Quantity must be > 0");

        _batchCounter++;
        uint256 newId = _batchCounter;

        Batch storage b = _batches[newId];
        b.id = newId;
        b.farmer = msg.sender;
        b.currentState = State.Harvested;
        b.exists = true;

        b.harvest = HarvestInfo({
            cropName: cropName,
            quantity: quantity,
            location: location,
            harvestDate: harvestDate,
            description: description,
            pricePerKg: pricePerKg
        });

        _batchIds.push(newId);

        emit BatchHarvested(newId, msg.sender, cropName, block.timestamp);
        return newId;
    }

    /**
     * @dev Processor updates quality and packaging info
     */
    function processItem(
        uint256 batchId,
        string calldata qualityGrade,
        int256 temperature,
        string calldata packagingType,
        string calldata notes
    )
        external
        batchExists(batchId)
        inState(batchId, State.Harvested)
    {
        Batch storage b = _batches[batchId];
        b.processor = msg.sender;
        b.currentState = State.Processed;

        b.process = ProcessInfo({
            qualityGrade: qualityGrade,
            temperature: temperature,
            packagingType: packagingType,
            processDate: block.timestamp,
            notes: notes
        });

        emit BatchProcessed(batchId, msg.sender, qualityGrade, block.timestamp);
    }

    /**
     * @dev Distributor records shipment details
     */
    function shipItem(
        uint256 batchId,
        string calldata vehicleNumber,
        string calldata driverName,
        string calldata origin,
        string calldata destination,
        uint256 expectedDelivery
    )
        external
        batchExists(batchId)
        inState(batchId, State.Processed)
    {
        Batch storage b = _batches[batchId];
        b.distributor = msg.sender;
        b.currentState = State.InTransit;

        b.ship = ShipInfo({
            vehicleNumber: vehicleNumber,
            driverName: driverName,
            origin: origin,
            destination: destination,
            shipDate: block.timestamp,
            expectedDelivery: expectedDelivery
        });

        emit BatchShipped(batchId, msg.sender, vehicleNumber, block.timestamp);
    }

    /**
     * @dev Retailer confirms delivery
     */
    function deliverItem(
        uint256 batchId,
        string calldata condition,
        uint256 receivedQty,
        string calldata remarks
    )
        external
        batchExists(batchId)
        inState(batchId, State.InTransit)
    {
        Batch storage b = _batches[batchId];
        b.retailer = msg.sender;
        b.currentState = State.Delivered;

        b.deliver = DeliverInfo({
            arrivalDate: block.timestamp,
            condition: condition,
            receivedQty: receivedQty,
            remarks: remarks
        });

        emit BatchDelivered(batchId, msg.sender, condition, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  View Functions
    // ─────────────────────────────────────────────

    /**
     * @dev Get harvest information for a batch
     */
    function getHarvestInfo(uint256 batchId)
        external
        view
        batchExists(batchId)
        returns (HarvestInfo memory)
    {
        return _batches[batchId].harvest;
    }

    /**
     * @dev Get process information for a batch
     */
    function getProcessInfo(uint256 batchId)
        external
        view
        batchExists(batchId)
        returns (ProcessInfo memory)
    {
        return _batches[batchId].process;
    }

    /**
     * @dev Get shipment information for a batch
     */
    function getShipInfo(uint256 batchId)
        external
        view
        batchExists(batchId)
        returns (ShipInfo memory)
    {
        return _batches[batchId].ship;
    }

    /**
     * @dev Get delivery information for a batch
     */
    function getDeliverInfo(uint256 batchId)
        external
        view
        batchExists(batchId)
        returns (DeliverInfo memory)
    {
        return _batches[batchId].deliver;
    }

    /**
     * @dev Get core batch metadata
     */
    function getBatchMeta(uint256 batchId)
        external
        view
        batchExists(batchId)
        returns (
            uint256 id,
            address farmer,
            address processor,
            address distributor,
            address retailer,
            uint8 currentState
        )
    {
        Batch storage b = _batches[batchId];
        return (
            b.id,
            b.farmer,
            b.processor,
            b.distributor,
            b.retailer,
            uint8(b.currentState)
        );
    }

    /**
     * @dev Get total number of batches
     */
    function getBatchCount() external view returns (uint256) {
        return _batchCounter;
    }

    /**
     * @dev Get all batch IDs
     */
    function getAllBatchIds() external view returns (uint256[] memory) {
        return _batchIds;
    }

    /**
     * @dev Check if a batch exists
     */
    function batchExistsCheck(uint256 batchId) external view returns (bool) {
        return _batches[batchId].exists;
    }
}
