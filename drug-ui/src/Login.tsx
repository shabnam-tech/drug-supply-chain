import { useState } from "react";

type Role = "Manufacturer" | "Distributor" | "Pharmacy" | "Customer";

type LoginProps = {
  onLogin: (role: Role) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role>("Manufacturer");

  const handleLogin = () => {
    onLogin(selectedRole);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">DrugChain Access</h2>
        <p className="text-center text-slate-600 mb-6">
          Login with your role to continue to cold chain monitoring.
        </p>

        <select
          className="w-full p-3 border rounded-lg mb-4"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
        >
          <option value="Manufacturer">Manufacturer</option>
          <option value="Distributor">Distributor</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Customer">Customer</option>
        </select>

        <button
          onClick={handleLogin}
          className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}