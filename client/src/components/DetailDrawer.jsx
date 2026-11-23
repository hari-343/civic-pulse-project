import React, { useState } from "react";
import { CheckCircle2, Clock, Wrench, X } from "lucide-react";

export default function DetailDrawer({ grievance, role, onClose, onStatusChange, onResolve }) {
  const [afterImage, setAfterImage] = useState(null);
  const [verifying, setVerifying] = useState(false);

  if (!grievance) return null;

  const formatSla = (deadline) => {
    if (grievance.status === "Resolved") return "Completed";
    if (!deadline) return "N/A";
    const diffHrs = Math.round((new Date(deadline) - Date.now()) / (1000 * 60 * 60));
    return diffHrs > 0 ? `${diffHrs}h remaining` : `Overdue by ${Math.abs(diffHrs)}h`;
  };

  const handleVerifyClick = async () => {
    if (!afterImage) return alert("Please select an After-Fix photo first.");
    setVerifying(true);
    try {
      await onResolve(grievance._id, afterImage);
      setAfterImage(null);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl border-l overflow-y-auto z-[1000] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">
            {grievance.category} • {grievance.status}
          </p>
          <h2 className="text-lg font-bold text-slate-900">{grievance.title}</h2>
          <p className="text-xs text-slate-500">
            {grievance.department} • {grievance.address}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {grievance.beforeImageUrl && (
        <img src={grievance.beforeImageUrl} alt="Reported issue" className="w-full h-44 object-cover rounded-lg border" />
      )}

      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
        <span>Reported by {grievance.reportCount} citizen(s)</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> SLA: {formatSla(grievance.slaDeadline)}
        </span>
      </div>

      <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-2">
        <span className="font-semibold">AI Severity ({grievance.severityScore}/10):</span> {grievance.severityReason}
      </div>

      <div className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2">
        <span className="font-semibold">Formal Complaint:</span> {grievance.formalComplaint}
      </div>

      {grievance.afterImageUrl && (
        <div>
          <p className="text-xs font-semibold flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            After-Fix Proof ({grievance.resolutionVerified ? "AI Verified" : "Rejected by AI"})
          </p>
          <img src={grievance.afterImageUrl} alt="After fix" className="w-full h-44 object-cover rounded-lg border" />
          <p className="text-xs text-slate-500 mt-1">{grievance.verificationNote}</p>
        </div>
      )}

      {role === "officer" && grievance.status !== "Resolved" && (
        <div className="border-t pt-3 space-y-2">
          {grievance.status === "Open" && (
            <button
              onClick={() => onStatusChange(grievance._id, "In Progress")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-4 h-4" /> Mark as In Progress
            </button>
          )}
          <p className="text-xs font-semibold">AI Resolution Audit: Upload After-Fix Photo</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAfterImage(e.target.files[0])}
            className="text-xs w-full border rounded-lg p-1.5"
          />
          <button
            onClick={handleVerifyClick}
            disabled={verifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {verifying ? "AI Auditing Fix..." : "Verify & Resolve with AI"}
          </button>
        </div>
      )}
    </div>
  );
}
