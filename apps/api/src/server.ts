import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scanRouter from "./routes/scan";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", scanRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "AlfaBrowserautomation API" });
});

app.listen(PORT, () => {
  console.log(`🚀 AlfaBrowserautomation API running on http://localhost:${PORT}`);
});
export default app;
