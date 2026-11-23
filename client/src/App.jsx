import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { Clock } from "lucide-react";
import Navbar from "./components/Navbar";
import KpiBar from "./components/KpiBar";
import DetailDrawer from "./components/DetailDrawer";
import ReportModal from "./components/ReportModal";
import {
  fetchGrievancesApi,
  createGrievanceApi,
  updateStatusApi,
  resolveGrievanceApi,
} from "./services/api";

const getPinColor = (g) => {
  if (g.status === "Resolved") return "#16a34a"; // green
  if (g.severityScore >= 8) return "#dc2626"; // red
  return "#eab308"; // yellow
};

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function App() {
  const [grievances, setGrievances] = useState([]);
  const [role, setRole] = useState("citizen");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGrievances = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== "All") params.category = categoryFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      const { data } = await fetchGrievancesApi(params);
      setGrievances(data);
    } catch (err) {
      console.error("Failed to load grievances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, [categoryFilter, statusFilter]);

  const handleReportSubmit = async (formData) => {
    try {
      const { data } = await createGrievanceApi(formData);
      alert(data.merged ? data.message : "Issue triaged & logged by AI!");
      setSelected(data.grievance);
      await loadGrievances();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit report.");
      throw err;
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await updateStatusApi(id, status);
      setSelected(data);
      await loadGrievances();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleResolve = async (id, afterImage) => {
    try {
      const formData = new FormData();
      formData.append("image", afterImage);
      const { data } = await resolveGrievanceApi(id, formData);
      alert(data.audit.verified ? `AI Audit PASSED: ${data.audit.note}` : `AI Audit REJECTED: ${data.audit.note}`);
      setSelected(data.grievance);
      await loadGrievances();
    } catch {
      alert("AI verification failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar role={role} setRole={setRole} onOpenReport={() => setShowReportModal(true)} />
      <KpiBar grievances={grievances} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3">
        {/* Sidebar queue */}
        <div className="border-r bg-white p-4 overflow-y-auto max-h-[70vh] lg:max-h-[76vh]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-semibold text-slate-800">Live Triage Queue</h2>
            <div className="flex gap-1.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md px-2 py-1 text-xs"
              >
                {["All", "Roads", "Water", "Sanitation", "Electricity", "Drainage", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-2 py-1 text-xs"
              >
                {["All", "Open", "In Progress", "Resolved"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 text-center py-8">Loading grievances...</p>
          ) : grievances.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No grievances found for this filter.</p>
          ) : (
            <div className="space-y-3">
              {grievances.map((g) => (
                <div
                  key={g._id}
                  onClick={() => setSelected(g)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selected?._id === g._id ? "border-emerald-500 bg-emerald-50/40 shadow-sm" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {g.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                        g.status === "Resolved" ? "bg-emerald-600" : g.severityScore >= 8 ? "bg-red-600" : "bg-amber-500"
                      }`}
                    >
                      {g.status === "Resolved" ? "Resolved" : `Severity ${g.severityScore}/10`}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mt-1.5 text-slate-900">{g.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{g.department}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{g.reportCount} citizen report(s)</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {g.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 relative min-h-[520px]">
          <MapContainer center={[11.0168, 76.9558]} zoom={13} className="h-full w-full">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onPick={(latlng) => setPickedCoords(latlng)} />

            {pickedCoords && (
              <CircleMarker
                center={[pickedCoords.lat, pickedCoords.lng]}
                radius={6}
                pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.9 }}
              >
                <Popup>Selected report location</Popup>
              </CircleMarker>
            )}

            {grievances.map((g) => (
              <CircleMarker
                key={g._id}
                center={[g.location.coordinates[1], g.location.coordinates[0]]}
                radius={10}
                pathOptions={{ color: getPinColor(g), fillColor: getPinColor(g), fillOpacity: 0.85 }}
                eventHandlers={{ click: () => setSelected(g) }}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{g.title}</p>
                    <p>Severity: {g.severityScore}/10 ({g.status})</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          <DetailDrawer
            grievance={selected}
            role={role}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onResolve={handleResolve}
          />
        </div>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        pickedCoords={pickedCoords}
      />
    </div>
  );
}
