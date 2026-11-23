import { GoogleGenAI } from "@google/genai";
import Grievance from "../models/Grievance.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY in server/.env");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const urlToInlineData = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch existing before-image.");
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  return { inlineData: { data: buffer.toString("base64"), mimeType } };
};

// POST /api/grievances — Report & AI triage
export const createGrievance = async (req, res, next) => {
  try {
    const { description = "", lat, lng, address = "" } = req.body;
    if (!req.file || !lat || !lng) {
      return res.status(400).json({ error: "Image, latitude, and longitude are required." });
    }

    const ai = getAI();
    const imagePart = {
      inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype },
    };

    const prompt = `You are a civic infrastructure triage AI. Analyze the uploaded image and citizen note: "${description}".
Return strictly valid JSON with these exact keys:
{
  "isValidCivicIssue": boolean,
  "title": "max 6 words",
  "category": "Roads" | "Water" | "Sanitation" | "Electricity" | "Drainage" | "Other",
  "department": "relevant Indian municipal department",
  "severityScore": number (1-10 based on public safety risk),
  "severityReason": "1 concise sentence",
  "estimatedSlaHours": number (e.g. 12 for critical, 48 for medium, 72 for minor),
  "formalComplaint": "3-sentence official complaint notice"
}`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt, imagePart],
      config: { responseMimeType: "application/json" },
    });

    const triage = JSON.parse(aiResponse.text);

    if (!triage.isValidCivicIssue) {
      return res.status(400).json({
        error: "Image does not appear to be a valid civic infrastructure issue.",
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Duplicate detection: same category, still open, within 50 m
    const existing = await Grievance.findOne({
      category: triage.category,
      status: { $ne: "Resolved" },
      location: { $near: { $geometry: { type: "Point", coordinates }, $maxDistance: 50 } },
    });

    if (existing) {
      existing.reportCount += 1;
      existing.severityScore = Math.min(10, Math.max(existing.severityScore, triage.severityScore));
      await existing.save();
      return res.status(200).json({
        merged: true,
        message: "Duplicate nearby issue detected! Merged to boost priority.",
        grievance: existing,
      });
    }

    const beforeImageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    const slaDeadline = new Date(Date.now() + (triage.estimatedSlaHours || 48) * 60 * 60 * 1000);

    const grievance = await Grievance.create({
      title: triage.title,
      description,
      formalComplaint: triage.formalComplaint,
      category: triage.category,
      department: triage.department,
      severityScore: triage.severityScore,
      severityReason: triage.severityReason,
      location: { type: "Point", coordinates },
      address: address || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`,
      beforeImageUrl,
      slaDeadline,
    });

    res.status(201).json({ merged: false, grievance });
  } catch (err) {
    next(err);
  }
};

// GET /api/grievances — dashboard feed
export const getGrievances = async (req, res, next) => {
  try {
    const { category, status, minSeverity } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (status && status !== "All") filter.status = status;
    if (minSeverity) filter.severityScore = { $gte: Number(minSeverity) };
    const grievances = await Grievance.find(filter).sort({ severityScore: -1, createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/grievances/:id/status
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    const grievance = await Grievance.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!grievance) return res.status(404).json({ error: "Grievance not found." });
    res.json(grievance);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/grievances/:id/resolve — AI before vs after verifier
export const resolveGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ error: "Grievance not found." });
    if (!req.file) return res.status(400).json({ error: "After-fix photo is required." });

    const ai = getAI();
    const beforePart = await urlToInlineData(grievance.beforeImageUrl);
    const afterPart = {
      inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype },
    };

    const verifyPrompt = `Compare Image 1 (reported civic issue: "${grievance.title}") and Image 2 (claimed fix).
Does Image 2 show the same location with the issue genuinely resolved?
Return strictly valid JSON: { "verified": boolean, "confidence": number, "note": "1-sentence audit reason" }`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [verifyPrompt, beforePart, afterPart],
      config: { responseMimeType: "application/json" },
    });

    const audit = JSON.parse(aiResponse.text);
    const afterImageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    grievance.afterImageUrl = afterImageUrl;
    grievance.resolutionVerified = audit.verified;
    grievance.verificationNote = audit.note;
    if (audit.verified) grievance.status = "Resolved";

    await grievance.save();
    res.json({ audit, grievance });
  } catch (err) {
    next(err);
  }
};
