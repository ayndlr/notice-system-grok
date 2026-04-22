const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
// Increase limit for base64 attachments (5MB limit requested)
app.use(express.json({ limit: "10mb" }));

const MONGO_URI =
  "mongodb://notice-board-sys:notice-board-sys-sticks@ac-w5b57gt-shard-00-00.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-01.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-02.wcrralm.mongodb.net:27017/?ssl=true&replicaSet=atlas-q26fhi-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

const Notice = mongoose.model(
  "Notice",
  new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    date: { type: Date, default: Date.now },
    author: String,
    attachment: {
      data: String, // Base64 string
      name: String, // Filename
      type: String, // MimeType
    },
  }),
);

// Login Logic
app.post("/api/login", (req, res) => {
  // Shared credentials as per requirement
  if (
    req.body.username === "ISSTICKZ" &&
    req.body.password === "isstickz@661"
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// GET all notices with optional search query
app.get("/api/notices", async (req, res) => {
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
});

// POST new notice
app.post("/api/notices", async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update notice
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

// DELETE notice
app.delete("/api/notices/:id", async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
