import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    formalComplaint: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Roads", "Water", "Sanitation", "Electricity", "Drainage", "Other"],
      required: true,
    },
    department: { type: String, default: "Municipal Corporation" },
    severityScore: { type: Number, min: 1, max: 10, required: true },
    severityReason: { type: String, default: "" },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, default: "" },
    beforeImageUrl: { type: String, required: true },
    afterImageUrl: { type: String, default: "" },
    resolutionVerified: { type: Boolean, default: false },
    verificationNote: { type: String, default: "" },
    reportCount: { type: Number, default: 1 },
    slaDeadline: { type: Date },
  },
  { timestamps: true }
);

grievanceSchema.index({ location: "2dsphere" });

export default mongoose.model("Grievance", grievanceSchema);
