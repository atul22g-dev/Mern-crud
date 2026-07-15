const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5500;
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

app.use(
    cors({
        origin: [
            "https://mern-crud-sacq.onrender.com",
            "http://localhost:3000",
            "http://localhost:5173",
        ],
        credentials: true,
    })
);

// Database Connection
require("./Database/conn");

// Product Schema
const Product = mongoose.models.Product ||
    mongoose.model(
        "Product",
        new mongoose.Schema({
            name: String,
            price: Number,
        })
    );

// Home Route
app.get("/", (_req, res) => {
    res.send("Welcome to Node.js Express API 🚀");
});

// Database Status
app.get("/db-status", (_req, res) => {
    const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };

    res.json({
        database: states[mongoose.connection.readyState],
    });
});

// Create Product
app.post("/api/products", async (req, res) => {
    try {
        const product = await Product.create({
            name: req.body.name,
            price: req.body.price,
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// Get All Products
app.get("/api/products", async (_req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Product By Id
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Product
app.put("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                price: req.body.price,
            },
            {
                new: true,
            }
        );

        res.json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const result = await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Health Check
app.get("/api/status", (_req, res) => {
    res.json({
        success: true,
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1,
    });
});
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
module.exports = app;