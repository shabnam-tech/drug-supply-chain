import { useState } from "react";
import { getContract } from "./blockchain";

type AddDrugProps = {
  onDrugAdded?: (batchId: string) => void;
};

function AddDrug({ onDrugAdded }: AddDrugProps) {
  const [drugName, setDrugName] = useState("");
  const [batchId, setBatchId] = useState("");
  const [minTemp, setMinTemp] = useState("");
  const [maxTemp, setMaxTemp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!batchId || !drugName || minTemp === "" || maxTemp === "") {
        alert("Please fill all fields.");
        return;
      }

      setIsSubmitting(true);
      const contract = await getContract({ requireSigner: true });

      const tx = await contract.registerBatch(
        batchId,
        drugName,
        Number(minTemp),
        Number(maxTemp)
      );

      await tx.wait();
      onDrugAdded?.(batchId);

      alert("✅ Drug Added Successfully!");
      setDrugName("");
      setBatchId("");
      setMinTemp("");
      setMaxTemp("");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error adding drug";
      alert(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-3xl font-bold mb-6">Add Drug</h2>

      <div className="space-y-4 bg-white p-6 rounded-2xl shadow">
        <input
          className="border p-3 w-full rounded-lg"
          placeholder="Drug Name"
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
        />

        <input
          className="border p-3 w-full rounded-lg"
          placeholder="Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />

        <input
          className="border p-3 w-full rounded-lg"
          placeholder="Min Temp"
          value={minTemp}
          onChange={(e) => setMinTemp(e.target.value)}
        />

        <input
          className="border p-3 w-full rounded-lg"
          placeholder="Max Temp"
          value={maxTemp}
          onChange={(e) => setMaxTemp(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default AddDrug;