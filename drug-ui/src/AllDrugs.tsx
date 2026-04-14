import { Fragment, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getAllBatches } from "./blockchain";
import type { DrugBatch } from "./blockchain";
 
export default function AllDrugs() {
  const [rows, setRows] = useState<DrugBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQrBatchId, setActiveQrBatchId] = useState<string | null>(null);

  const loadRows = async () => {
    setLoading(true);
    try {
      const data = await getAllBatches();
      setRows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">All Registered Drugs</h2>
      <p className="text-gray-600 mb-4">
        Showing {rows.length} registered batch{rows.length === 1 ? "" : "es"} from blockchain.
      </p>
      <button
        onClick={loadRows}
        className="mb-4 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black"
      >
        Refresh
      </button>

      {loading && <p className="text-gray-600">Loading batch details...</p>}

      {!loading && !rows.length && (
        <div className="bg-white rounded-xl shadow p-4 text-gray-600">
          No batches saved yet. Add a drug first.
        </div>
      )}

      {!!rows.length && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Batch ID</th>
                <th className="text-left p-3">Drug Name</th>
                <th className="text-left p-3">Temp Range</th>
                <th className="text-left p-3">Owner</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">QR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOpen = activeQrBatchId === row.batchId;
                return (
                  <Fragment key={row.batchId}>
                    <tr className="border-t">
                      <td className="p-3">{row.batchId}</td>
                      <td className="p-3">{row.drugName}</td>
                      <td className="p-3">
                        {row.minTemp} to {row.maxTemp} C
                      </td>
                      <td className="p-3">{row.owner}</td>
                      <td className="p-3 font-semibold">{row.status || "N/A"}</td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            setActiveQrBatchId((prev) => (prev === row.batchId ? null : row.batchId))
                          }
                          className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black"
                        >
                          {isOpen ? "Hide QR" : "Generate QR"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50 border-t">
                        <td className="p-4" colSpan={6}>
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="bg-white p-3 rounded-lg border w-fit">
                              <QRCodeCanvas value={row.batchId} size={150} includeMargin />
                            </div>
                            <div>
                              <p className="font-medium">QR content:</p>
                              <p className="text-slate-700 font-mono">{row.batchId}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Scan this QR in Track Drug to auto-fill the batch ID.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
