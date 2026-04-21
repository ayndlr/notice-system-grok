const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
  }),
);

// New Login Credentials
app.post("/api/login", (req, res) => {
  if (
    req.body.username === "ISSTICKZ" &&
    req.body.password === "isstickz@661"
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get("/api/notices", async (req, res) => {
  const notices = await Notice.find().sort({ date: -1 });
  res.json(notices);
});

app.post("/api/notices", async (req, res) => {
  const notice = new Notice(req.body);
  await notice.save();
  res.status(201).json(notice);
});

app.delete("/api/notices/:id", async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000"),
);
