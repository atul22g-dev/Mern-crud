const express = require("express");
require('dotenv').config()
const PORT = process.env.PORT || 5500;
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { cronAuth } = require("./middleware/auth.middleware");
app.use(express.json());
app.use(cors('https://mern-crud-sacq.onrender.com/post', 'https://mern-crud-sacq.onrender.com/post', 'https://mern-crud-sacq.onrender.com/api/products'));

// Database connection
require("./Database/conn");
// UseSchema
const Product = mongoose.model("Product", { name: String, price: Number });

// Routes
app.get('/db-status', async (req, res) => {
  const db = mongoose.connection;
  console.log(db.readyState);
  if (db.readyState === 1) {
    res.status(200).send('Database is connected');
  } else {
    res.status(500).send('Database is not connected');
  }
});

app.get("/", (req, res) => {
  return res.send("Welcome to Node js, express js in Docker");
});

app.post("/api/products", async (req, res) => {
  const product = new Product({ name: req.body.name, price: req.body.price });
  const savedProduct = await product.save();
  return res.status(201).json(savedProduct);
});

app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  return res.json(products);
});

// Find by Id
app.get("/api/products/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Product.findById(_id);
    return res.send("Result  " + result);
  } catch (error) {
    res.send("Err   " + error);
  }
});

// update request?
app.put("/api/products/:id", async (req, res) => {
  // console.log(req.params.id);
  try {
    const result = await Product.updateMany(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          price: req.body.price,
        },
      }
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).send(error);
  }
});

// Database status endpoint
app.get('/api/status', async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    status: 'success',
    message: `Server is running`,
    data: {
      database: states[dbState] || 'unknown',
      uptime: process.uptime(),
    },
  });
});

// ─── MongoDB Connection CronJob ─────────────────────────────────────────────────────

app.get("/api/db-heartbeat", cronAuth, async (req, res) => {
  try {
    await mongoose.connection.db
      .collection("heartbeat")
      .updateOne(
        { _id: "heartbeat" },
        { $set: { lastRun: new Date() } },
        { upsert: true }
      );

    res.json({
      success: true,
      message: "Heartbeat updated"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  // console.log("Deleting......." + req.params.id);
  const product = await Product.deleteOne({ _id: req.params.id });
  console.log(product);
  return res.json(product);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
module.exports = app;