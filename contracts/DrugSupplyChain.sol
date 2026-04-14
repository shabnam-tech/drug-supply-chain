// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DrugSupplyChain {

    struct DrugBatch {
        string batchId;
        string drugName;
        int minTemp;
        int maxTemp;
        string owner;
        string status;
    }

    mapping(string => DrugBatch) public batches;
    mapping(string => bool) public batchExists;
    string[] private batchIds;

    event BatchRegistered(string indexed batchId, string drugName);
    event OwnershipTransferred(string indexed batchId, string newOwner);
    event TemperatureRecorded(string indexed batchId, int temp, string status);

    // Register batch
    function registerBatch(
        string memory _batchId,
        string memory _drugName,
        int _minTemp,
        int _maxTemp
    ) public {
        require(bytes(_batchId).length > 0, "Batch ID required");
        require(!batchExists[_batchId], "Batch already exists");

        batches[_batchId] = DrugBatch(
            _batchId,
            _drugName,
            _minTemp,
            _maxTemp,
            "Manufacturer",
            "Safe"
        );

        batchExists[_batchId] = true;
        batchIds.push(_batchId);
        emit BatchRegistered(_batchId, _drugName);
    }

    // Transfer ownership
    function transferBatch(
        string memory _batchId,
        string memory _newOwner
    ) public {
        require(batchExists[_batchId], "Batch not found");

        batches[_batchId].owner = _newOwner;
        emit OwnershipTransferred(_batchId, _newOwner);
    }

    // Record temperature
    function recordTemperature(
        string memory _batchId,
        int _temp
    ) public {
        require(batchExists[_batchId], "Batch not found");

        if(
            _temp < batches[_batchId].minTemp ||
            _temp > batches[_batchId].maxTemp
        ){
            batches[_batchId].status = "Compromised";
        }

        emit TemperatureRecorded(_batchId, _temp, batches[_batchId].status);
    }

    function getStatus(string memory _batchId) public view returns (string memory) {
        require(batchExists[_batchId], "Batch not found");
        return batches[_batchId].status;
    }

    function getBatchIds() public view returns (string[] memory) {
        return batchIds;
    }

}