const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Enable CORS for frontend integration
app.use(cors());

// Increase limit for base64 attachments (10MB to accommodate the 5MB request comfortably)
app.use(express.json({ limit: "10mb" }));

// MongoDB Connection URI
const MONGO_URI =
  "mongodb://notice-board-sys:notice-board-sys-sticks@ac-w5b57gt-shard-00-00.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-01.wcrralm.mongodb.net:27017,ac-w5b57gt-shard-00-02.wcrralm.mongodb.net:27017/?ssl=true&replicaSet=atlas-q26fhi-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Define Notice Schema and Model
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: String, required: true },
  attachment: {
    data: String, // Base64 encoded string of the file
    name: String, // Original filename
    type: String, // MIME type (e.g., application/pdf, image/png)
  },
});

const Notice = mongoose.model("Notice", noticeSchema);

/** * AUTHENTICATION ROUTE
 * Requirement: Shared credentials for administrative access
 */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "ISSTICKZ" && password === "isstickz@661") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

/** * GET ALL NOTICES
 * Supports optional search query 'q' across title, content, and author
 */
app.get("/api/notices", async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      // Case-insensitive search across multiple fields
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

/** * CREATE NEW NOTICE
 */
app.post("/api/notices", async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** * UPDATE NOTICE
 */
app.put("/api/notices/:id", async (req, res) => {
  try {
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedNotice)
      return res.status(404).json({ error: "Notice not found" });
    res.json(updatedNotice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** * DELETE NOTICE
 */
app.delete("/api/notices/:id", async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Notice not found" });
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
