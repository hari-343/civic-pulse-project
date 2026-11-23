import React from "react";
import { Plus, ShieldCheck } from "lucide-react";

export default function Navbar({ role, setRole, onOpenReport }) {
  return (
    <header className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-emerald-400" />
        <div>
          <h1 className="font-bold text-lg leading-tight">Civic Pulse</h1>
          <p className="text-xs text-slate-400">Transparent AI Grievance & Infrastructure Triage</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-slate-800 rounded-lg p-1 text-sm">
          <button
            onClick={() => setRole("citizen")}
            className={`px-3 py-1 rounded-md transition ${
              role === "citizen" ? "bg-emerald-600 text-white font-medium" : "text-slate-300 hover:text-white"
            }`}
          >
            Citizen View
          </button>
          <button
            onClick={() => setRole("officer")}
            className={`px-3 py-1 rounded-md transition ${
              role === "officer" ? "bg-blue-600 text-white font-medium" : "text-slate-300 hover:text-white"
            }`}
          >
            Officer View
          </button>
        </div>
        <button
          onClick={onOpenReport}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>
    </header>
  );
}
