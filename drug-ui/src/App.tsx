import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login";
import AddDrug from "./AddDrug";
import TrackDrug from "./TrackDrug";
import AllDrugs from "./AllDrugs";
import { getAllBatches } from "./blockchain";

type Role = "Manufacturer" | "Distributor" | "Pharmacy" | "Customer";

const ROLE_STORAGE_KEY = "drugchain_role";

const readStoredRole = (): Role | null => {
  const value = localStorage.getItem(ROLE_STORAGE_KEY);
  if (
    value === "Manufacturer" ||
    value === "Distributor" ||
    value === "Pharmacy" ||
    value === "Customer"
  ) {
    return value;
  }
  return null;
};

function Sidebar({ role, onLogout }: { role: Role; onLogout: () => void }) {
  return (
    <div className="w-72 h-screen bg-slate-950 text-slate-100 p-6 flex flex-col border-r border-slate-800">
      <h1 className="text-2xl font-bold mb-1">DrugChain</h1>
      <p className="text-xs text-slate-400 mb-8">Cold Chain Monitoring DApp</p>

      <nav className="space-y-2">
        <Link className="block rounded-lg px-3 py-2 hover:bg-slate-800" to="/">Dashboard</Link>
        {role === "Manufacturer" && (
          <Link className="block rounded-lg px-3 py-2 hover:bg-slate-800" to="/add">Add Drug</Link>
        )}
        <Link className="block rounded-lg px-3 py-2 hover:bg-slate-800" to="/track">Track Drug</Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-slate-800" to="/drugs">All Drugs</Link>
      </nav>

      <div className="mt-auto text-sm text-slate-300">
        Logged in as <span className="font-semibold">{role}</span>
        <button
          onClick={onLogout}
          className="block mt-3 text-xs px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function Dashboard({ role, totalDrugs }: { role: Role; totalDrugs: number }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold">{role} Dashboard</h2>
      <p className="text-slate-600 mt-1">Blockchain-powered cold chain supply monitoring.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-500 text-sm">Active Role</p>
          <p className="text-xl font-semibold">{role}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-500 text-sm">Registered Batches (On-chain)</p>
          <p className="text-xl font-semibold">{totalDrugs}</p>
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="text-gray-600">Your current role does not have permission to open this page.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(readStoredRole());
  const [totalDrugs, setTotalDrugs] = useState(0);

  const canAddDrug = useMemo(() => role === "Manufacturer", [role]);

  const onLogin = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const onLogout = () => {
    setRole(null);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  };

  const refreshStats = async () => {
    try {
      const rows = await getAllBatches();
      setTotalDrugs(rows.length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const onDrugAdded = () => {
    refreshStats();
  };

  if (!role) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <div className="flex">
      <Sidebar role={role} onLogout={onLogout} />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard role={role} totalDrugs={totalDrugs} />} />
          <Route path="/track" element={<TrackDrug />} />
          <Route path="/drugs" element={<AllDrugs />} />
          <Route
            path="/add"
            element={canAddDrug ? <AddDrug onDrugAdded={onDrugAdded} /> : <AccessDenied />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}