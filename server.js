const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(cors()); // Allows your Netlify frontend to talk to this backend
app.use(express.json({ limit: "10mb" })); // Handles large base64 files
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 2. MONGODB CONNECTION
const MONGO_URI =
  "mongodb://notice-board-sys:notice-board-sys-sticks@ac-w5b57gt-shard-00-00.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-01.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-02.wcrralm.mongodb.net:27017/?ssl=true&replicaSet=atlas-q26fhi-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection error:", err.message));

// 3. DATA MODEL
const Notice = mongoose.model(
  "Notice",
  new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    author: { type: String, required: true },
    attachment: {
      data: String, // Base64 string
      name: String,
      type: String,
    },
  }),
);

// 4. API ROUTES (Matching the index.html calls)

// Authentication
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "ISSTICKZ" && password === "isstickz@661") {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Fetch all notices
app.get("/api/notices", async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    if (q) {
      query = {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
          { author: { $regex: q, $options: "i" } },
        ],
      };
    }
    const notices = await Notice.find(query).sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

// Create notice
app.post("/api/notices", async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update notice
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

// Delete notice
app.delete("/api/notices/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SERVER STARTUP
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server active on port ${PORT}`);
});
