import dotenv from "dotenv";
dotenv.config(); // must run before config files read process.env

const express = (await import("express")).default;
const cors = (await import("cors")).default;
const { connectDB } = await import("./config/db.js");
const { default: grievanceRoutes } = await import("./routes/grievanceRoutes.js");
const { errorHandler } = await import("./middleware/errorHandler.js");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Civic Pulse API is running", timestamp: new Date().toISOString() });
});

app.use("/api/grievances", grievanceRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
