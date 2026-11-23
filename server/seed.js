import dotenv from "dotenv";
import mongoose from "mongoose";
import Grievance from "./models/Grievance.js";

dotenv.config();

const hrs = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

const sampleGrievances = [
  {
    title: "Deep Pothole Near Gandhipuram Bus Stand",
    description: "Large waterlogged pothole causing two-wheeler skids during peak traffic.",
    formalComplaint: "Urgent road surface failure reported near Gandhipuram Central Bus Stand. Immediate cold-mix patching is required to prevent commuter accidents.",
    category: "Roads",
    department: "Coimbatore Corporation - Roads & Highways",
    severityScore: 9,
    severityReason: "High-traffic arterial road with immediate risk of two-wheeler accidents.",
    status: "Open",
    location: { type: "Point", coordinates: [76.9674, 11.0183] },
    address: "Gandhipuram, Coimbatore",
    beforeImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
    reportCount: 4,
    slaDeadline: hrs(12),
  },
  {
    title: "Overflowing Garbage Bin at RS Puram",
    description: "Uncollected municipal waste spilling onto the pedestrian footpath.",
    formalComplaint: "Sanitation hazard reported on DB Road, RS Puram. Requesting immediate waste clearance and bin sanitization.",
    category: "Sanitation",
    department: "Solid Waste Management Dept",
    severityScore: 6,
    severityReason: "Public hygiene concern blocking pedestrian walkway.",
    status: "In Progress",
    location: { type: "Point", coordinates: [76.9512, 11.0086] },
    address: "DB Road, RS Puram, Coimbatore",
    beforeImageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800",
    reportCount: 2,
    slaDeadline: hrs(36),
  },
  {
    title: "Burst Drinking Water Pipeline",
    description: "Continuous clean water leakage flooding the street corner since morning.",
    formalComplaint: "Major potable water pipeline rupture reported near Peelamedu. Immediate valve shutoff and pipe repair requested.",
    category: "Water",
    department: "TWAD / Municipal Water Supply",
    severityScore: 8,
    severityReason: "Significant wastage of treated water and road erosion risk.",
    status: "Open",
    location: { type: "Point", coordinates: [77.0028, 11.0283] },
    address: "Avinashi Road, Peelamedu, Coimbatore",
    beforeImageUrl: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800",
    reportCount: 3,
    slaDeadline: hrs(18),
  },
  {
    title: "Blocked Storm Water Drain",
    description: "Stagnant water accumulating near Ukkadam junction after light rain.",
    formalComplaint: "Clogged stormwater drain near Ukkadam causing waterlogging and mosquito breeding risk. Immediate desilting requested.",
    category: "Drainage",
    department: "Municipal Storm Water & Drainage Wing",
    severityScore: 7,
    severityReason: "Flooding and vector-borne disease hazard in a dense commuter zone.",
    status: "Open",
    location: { type: "Point", coordinates: [76.9616, 10.9902] },
    address: "Ukkadam, Coimbatore",
    beforeImageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800",
    reportCount: 2,
    slaDeadline: hrs(24),
  },
  {
    title: "Non-Functional Streetlights on Stretch",
    description: "Three consecutive LED streetlights are out near the junction.",
    formalComplaint: "Streetlight outage reported along Race Course Road. Restoring illumination is requested for night-time pedestrian safety.",
    category: "Electricity",
    department: "TANGEDCO / Municipal Electrical Wing",
    severityScore: 5,
    severityReason: "Reduced visibility at night increases safety risk for pedestrians.",
    status: "Resolved",
    location: { type: "Point", coordinates: [76.9765, 10.9982] },
    address: "Race Course Road, Coimbatore",
    beforeImageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800",
    afterImageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    resolutionVerified: true,
    verificationNote: "AI Audit verified working streetlights along the reported stretch.",
    reportCount: 1,
    slaDeadline: hrs(-5),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Grievance.deleteMany({});
    await Grievance.insertMany(sampleGrievances);
    console.log(`Seeded ${sampleGrievances.length} sample grievances successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();
