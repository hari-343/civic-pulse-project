import React from "react";
import { AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react";

export default function KpiBar({ grievances }) {
  const total = grievances.length;
  const critical = grievances.filter((g) => g.severityScore >= 8 && g.status !== "Resolved").length;
  const inProgress = grievances.filter((g) => g.status === "In Progress").length;
  const resolved = grievances.filter((g) => g.status === "Resolved").length;

  const cards = [
    { label: "Total Reports", value: total, Icon: MapPin, color: "text-slate-700" },
    { label: "Critical Open (8-10)", value: critical, Icon: AlertTriangle, color: "text-red-600" },
    { label: "In Progress", value: inProgress, Icon: Clock, color: "text-amber-600" },
    { label: "AI-Verified Fixes", value: resolved, Icon: CheckCircle2, color: "text-emerald-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border-b">
      {cards.map(({ label, value, Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border p-3 flex items-center gap-3">
          <Icon className={`w-6 h-6 ${color}`} />
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
