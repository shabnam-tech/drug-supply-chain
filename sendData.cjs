const { Web3 } = require("web3");
const fs = require("fs");
const csv = require("csv-parser");

const web3 = new Web3("http://127.0.0.1:7545");


const contractAddress = "0x5024a29202582255D50c251ae08CFA5B46174B7C";

const contractABI = require("./DrugSupplyChain.json").abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function main(){

    console.log("\nConnecting to blockchain...\n");

    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    console.log("Using account:", sender);

    const batchId = "BATCH001";

    console.log("\nSTEP 1: Registering Drug Batch\n");

    await contract.methods.registerBatch(
        batchId,
        "COVID Vaccine",
        2,
        8
    ).send({from: sender, gas: 3000000});

    console.log("Batch Registered Successfully\n");

    console.log("STEP 2: Reading Temperature Dataset\n");

    let rows = [];

    fs.createReadStream("temperature_data.csv")
    .pipe(csv())
    .on("data", (row)=>{
        rows.push(row);
    })
    .on("end", async ()=>{

        console.log("Dataset loaded");
        console.log("Total rows:", rows.length);

        console.log("\nSTEP 3: Sending Temperature Data to Blockchain\n");

        for(let i = 0; i < 5; i++){

            const temp = parseInt(rows[i].temperature);

            console.log("--------------------------------");
            console.log("Processing row:", i+1);
            console.log("Temperature:", temp);

            console.log("Sending transaction...");

            await contract.methods
            .recordTemperature(batchId, temp)
            .send({from: sender, gas: 3000000});

            console.log("Transaction mined successfully\n");
        }

        console.log("\nSTEP 4: Fetching Final Batch Data From Blockchain\n");

try {

    console.log("\nSTEP 4: Fetching Final Batch Data From Blockchain\n");

    const batch = await contract.methods.batches(batchId).call();
    console.log("RAW OUTPUT:", batch);

    console.log("Raw Data Returned:", batch);

    console.log("\n----- FINAL BATCH DATA -----");

    console.log("Batch ID:", batch[0]);
    console.log("Drug Name:", batch[1]);
    console.log("Min Temp:", batch[2]);
    console.log("Max Temp:", batch[3]);
    console.log("Owner:", batch[4]);
    console.log("Status:", batch[5]);

} catch(err){

    console.log("\nCould not decode struct using Web3.");
    console.log("But transactions were executed successfully.");

}

    });

}

main();