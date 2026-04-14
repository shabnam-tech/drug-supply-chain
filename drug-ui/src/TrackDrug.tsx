import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { getBatchDetails } from "./blockchain";
import type { DrugBatch } from "./blockchain";

function TrackDrug() {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState<DrugBatch | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const message = err instanceof Error ? err.message : "Error fetching status";
      alert(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-3xl font-bold mb-4">Track Drug</h2>

      <div className="bg-white rounded-xl shadow p-4 mb-4">
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
            {loading ? "Tracking..." : "Track"}
          </button>
          <button
            onClick={() => setShowScanner((prev) => !prev)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg"
          >
            {showScanner ? "Close QR Scanner" : "Scan QR"}
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Point your camera at a QR code containing a batch ID.
          </p>
          <Scanner
            onScan={(result) => {
              const raw = result?.[0]?.rawValue?.trim();
              if (raw) {
                setBatchId(raw);
                setShowScanner(false);
              }
            }}
            onError={(error) => {
              console.error(error);
            }}
          />
        </div>
      )}

      {batch && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Batch Details</h3>
          <p><span className="font-medium">Batch ID:</span> {batch.batchId}</p>
          <p><span className="font-medium">Drug Name:</span> {batch.drugName}</p>
          <p><span className="font-medium">Owner:</span> {batch.owner}</p>
          <p><span className="font-medium">Temperature Range:</span> {batch.minTemp} to {batch.maxTemp} C</p>
          <p><span className="font-medium">Status:</span> {batch.status}</p>
        </div>
      )}
    </div>
  );
}

export default TrackDrug;