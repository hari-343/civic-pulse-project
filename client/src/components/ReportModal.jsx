import React, { useEffect, useState } from "react";
import { MapPin, Mic, Upload, X } from "lucide-react";

export default function ReportModal({ isOpen, onClose, onSubmit, pickedCoords }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("11.0168");
  const [lng, setLng] = useState("76.9558");
  const [address, setAddress] = useState("Coimbatore, TN");
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pickedCoords) {
      setLat(pickedCoords.lat.toFixed(6));
      setLng(pickedCoords.lng.toFixed(6));
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => alert("Could not fetch GPS. Click on the map or enter coordinates manually.")
    );
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Web Speech API not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    setListening(true);
    recognition.onresult = (e) => {
      setDescription((prev) => `${prev} ${e.results[0][0].transcript}`.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please upload a photo of the issue.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("description", description);
      formData.append("lat", lat);
      formData.append("lng", lng);
      formData.append("address", address);
      await onSubmit(formData);
      setImageFile(null);
      setPreviewUrl("");
      setDescription("");
      onClose();
    } catch {
      /* error already shown by parent; keep modal open */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Report Civic Issue</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Upload Evidence Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm border rounded-lg p-2"
            />
            {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg border" />}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold">Description / Voice Note</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className="border rounded-md px-1 py-0.5 text-xs"
                >
                  <option value="en-IN">English</option>
                  <option value="ta-IN">தமிழ்</option>
                  <option value="hi-IN">हिन्दी</option>
                </select>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                >
                  <Mic className="w-3.5 h-3.5" />
                  {listening ? "Listening..." : "Speak"}
                </button>
              </div>
            </div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue or use voice input..."
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Location / Landmark</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Gandhipuram Bus Stand, Coimbatore"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Latitude</label>
              <input value={lat} onChange={(e) => setLat(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Longitude</label>
              <input value={lng} onChange={(e) => setLng(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseGPS}
            className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" /> Auto-detect my GPS location
          </button>
          <p className="text-[11px] text-slate-400">Tip: close this window, click the map to pick a spot, then reopen it.</p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {submitting ? "AI Analyzing Photo..." : "Submit & Run AI Triage"}
          </button>
        </form>
      </div>
    </div>
  );
}
