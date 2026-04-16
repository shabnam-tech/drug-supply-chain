import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Papa from "papaparse";
import { getBatchDetails, getContract } from "./blockchain";
import type { DrugBatch } from "./blockchain";

const ROLE_STORAGE_KEY = "drugchain_role";

function TrackDrug() {
  // ================= TRACKING =================
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState<DrugBatch | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= SENSOR INPUT =================
  const [temperature, setTemperature] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    setRole(storedRole);
  }, []);

  // ================= TRACK BATCH =================
  const handleTrack = async () => {
    try {
      if (!batchId) {
        alert("Please enter batch ID.");
        return;
      }

      setLoading(true);

      const result = await getBatchDetails(batchId);

      if (!result) {
        alert("Batch not found on blockchain.");
        setBatch(null);
        return;
      }

      setBatch(result);
    } catch (err) {
      console.error(err);
      alert("Error fetching batch");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND SINGLE SENSOR DATA =================
  const handleSendTemperature = async () => {
    try {
      if (!batchId || temperature === "") {
        alert("Enter batch ID and temperature");
        return;
      }

      const contract = await getContract({ requireSigner: true });

      const tx = await contract.recordTemperature(
        batchId,
        Number(temperature)
      );

      await tx.wait();

      alert("Temperature recorded on blockchain");

      setTemperature("");
      await handleTrack();
    } catch (err) {
      console.error(err);
      alert("Error sending temperature");
    }
  };

  // ================= CSV UPLOAD (IoT SIMULATION) =================
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        try {
          const contract = await getContract({ requireSigner: true });

          let success = 0;
          let skipped = 0;

          for (const row of results.data) {
            const id = row.batch_id;
            const temp = Number(row.temperature);

            try {
              const tx = await contract.recordTemperature(id, temp);
              await tx.wait();
              success++;
            } catch {
              skipped++;
            }
          }

          alert(`Upload Done\nSuccess: ${success}\nSkipped: ${skipped}`);
        } catch (err) {
          console.error(err);
          alert("CSV processing failed");
        }
      },
    });
  };

  // ================= UI =================
  return (
    <div className="p-6 max-w-4xl">

      <h2 className="text-3xl font-bold mb-6">Drug Tracking System</h2>

      {/* ================= TRACK SECTION ================= */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Track Batch Status</h3>

        <input
          className="border p-3 w-full rounded-lg mb-3"
          placeholder="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={handleTrack}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Checking..." : "Track"}
          </button>

          <button
            onClick={() => setShowScanner((s) => !s)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg"
          >
            {showScanner ? "Close QR" : "Scan QR"}
          </button>
        </div>
      </div>

      {/* ================= SENSOR INPUT SECTION ================= */}
      {role !== "Manufacturer" && (
        <div className="bg-slate-50 border rounded-xl p-4 mb-6">

          <h3 className="text-lg font-semibold mb-4">
            IoT Sensor Data Input (Simulation)
          </h3>

          {/* Manual input */}
          <div className="bg-white p-3 rounded-lg border mb-4">
            <p className="font-medium mb-2">Manual Temperature Reading</p>

            <input
              className="border p-3 w-full rounded-lg"
              placeholder="Enter temperature (°C)"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />

            <button
              onClick={handleSendTemperature}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Send Data
            </button>
          </div>

          {/* Divider */}
          <div className="text-center text-xs text-gray-500 my-3">
            OR upload IoT dataset
          </div>

          {/* CSV upload */}
          <div className="bg-white p-3 rounded-lg border">
            <p className="font-medium mb-2">Upload Sensor CSV</p>

            <label className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer inline-block">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>

            <p className="text-xs text-gray-500 mt-2">
              Required columns: batch_id, temperature, timestamp
            </p>
          </div>
        </div>
      )}

      {/* ================= QR SCANNER ================= */}
      {showScanner && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <Scanner
            onScan={(result) => {
              const raw = result?.[0]?.rawValue?.trim();
              if (raw) {
                setBatchId(raw);
                setShowScanner(false);
              }
            }}
            onError={(err) => console.error(err)}
          />
        </div>
      )}

      {/* ================= BATCH DETAILS ================= */}
      {batch && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Batch Details</h3>

          <p><b>ID:</b> {batch.batchId}</p>
          <p><b>Name:</b> {batch.drugName}</p>
          <p><b>Owner:</b> {batch.owner}</p>
          <p><b>Temp Range:</b> {batch.minTemp}°C - {batch.maxTemp}°C</p>
          <p><b>Status:</b> {batch.status}</p>
        </div>
      )}

    </div>
  );
}

export default TrackDrug;