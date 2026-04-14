const Web3 = require("web3");
const fs = require("fs");
const csv = require("csv-parser");

const web3 = new Web3("http://127.0.0.1:8545");

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = require("./DrugSupplyChain.json").abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);


async function main() {

    console.log("\nConnecting to blockchain...\n");

    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    console.log("Using account:", sender);

    let rows = [];
    let registeredBatches = new Set();

    fs.createReadStream("temperature_data.csv")
        .pipe(csv())
        .on("data", (row) => {
            rows.push(row);
        })
        .on("end", async () => {

            console.log("Dataset loaded");
            console.log("Total rows:", rows.length);

            for (let i = 0; i < rows.length; i++) {

                const batchId = rows[i].batch_id;
                const temp = parseInt(rows[i].temperature);

                console.log("--------------------------------");
                console.log("Processing row:", i + 1);
                console.log("Batch:", batchId);
                console.log("Temperature:", temp);

                if (!registeredBatches.has(batchId)) {

                    console.log("Registering new batch...");

                    await contract.methods.registerBatch(
                        batchId,
                        "Drug",
                        2,
                        8
                    ).send({ from: sender, gas: 3000000 });

                    registeredBatches.add(batchId);

                    console.log("Batch registered");
                }

                if (temp < 2 || temp > 8) {
                    console.log("TEMPERATURE VIOLATION DETECTED");
                }

                await contract.methods
                    .recordTemperature(batchId, temp)
                    .send({ from: sender, gas: 3000000 });

                const status = await contract.methods.getStatus(batchId).call();
                console.log("Current Status:", status);
            }

            console.log("\nFINAL STATUS OF ALL BATCHES\n");

            for (let batchId of registeredBatches) {

                const batch = await contract.methods.batches(batchId).call();

                console.log("--------------------------------");
                console.log("Batch ID:", batchId);

                const status = await contract.methods.getStatus(batchId).call();
                console.log("Status:", status);
            }
        });
}

main();