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

    // Register batch
    function registerBatch(
        string memory _batchId,
        string memory _drugName,
        int _minTemp,
        int _maxTemp
    ) public {

        batches[_batchId] = DrugBatch(
            _batchId,
            _drugName,
            _minTemp,
            _maxTemp,
            "Manufacturer",
            "Safe"
        );
    }

    // Transfer ownership
    function transferBatch(
        string memory _batchId,
        string memory _newOwner
    ) public {

        batches[_batchId].owner = _newOwner;
    }

    // Record temperature
    function recordTemperature(
        string memory _batchId,
        int _temp
    ) public {

        if(
            _temp < batches[_batchId].minTemp ||
            _temp > batches[_batchId].maxTemp
        ){
            batches[_batchId].status = "Compromised";
        }
    }
}