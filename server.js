const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 1. GLOBAL MIDDLEWARE
// Increased limit to 20mb to handle high-res images or documents
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// 2. MONGODB CONNECTION
const MONGO_URI =
  "mongodb://notice-board-sys:notice-board-sys-sticks@ac-w5b57gt-shard-00-00.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-01.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-02.wcrralm.mongodb.net:27017/?ssl=true&replicaSet=atlas-q26fhi-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection error:", err.message));

// 3. DATA MODEL
// Structured 'attachment' as an object to store metadata
const Notice = mongoose.model(
  "Notice",
  new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, default: "Master Admin" },
    date: { type: Date, default: Date.now },
    attachment: {
      data: String, // Base64 String
      name: String, // Filename (e.g. "schedule.pdf")
      type: String, // MIME type (e.g. "application/pdf")
    },
  }),
);

// 4. ROUTES
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "ISSTICKZ" && password === "issticks@661") {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.get("/api/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

app.post("/api/notices", async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/notices/:id", async (req, res) => {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
