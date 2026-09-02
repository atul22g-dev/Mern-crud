const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5500;
const cors = require("cors");
require("dotenv").config();
const { cronAuth } = require("./middleware/auth.middleware");

const app = express();

// Middleware
app.use(express.json());

const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://mern-crud-atul22g-dev.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    })
);

// Database Connection (serverless-ready with global caching)
const connectDB = require("./Database/conn.js");

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


/**
 * Wait for a connecting connection to resolve to either connected or disconnected.
 * Returns false if disconnected/timed out, true if connected.
 */
function waitForConnection(timeoutMs = 8000) {
    const readyState = mongoose.connection.readyState;
    // Already connected
    if (readyState === 1) return Promise.resolve(true);
    // Not in a connecting state — won't become connected
    if (readyState !== 2) return Promise.resolve(false);

    return new Promise((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                resolve(mongoose.connection.readyState === 1);
            }
        }, timeoutMs);

        const onConnected = () => {
            if (!settled) {
                settled = true;
                cleanup();
                resolve(true);
            }
        };
        const onDisconnected = () => {
            if (!settled) {
                settled = true;
                cleanup();
                resolve(false);
            }
        };

        const cleanup = () => {
            clearTimeout(timer);
            mongoose.connection.removeListener('connected', onConnected);
            mongoose.connection.removeListener('disconnected', onDisconnected);
        };

        mongoose.connection.once('connected', onConnected);
        mongoose.connection.once('disconnected', onDisconnected);
    });
}

// Database status endpoint
app.get('/api/status', async (_req, res, next) => {
    await connectDB()
    try {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        let dbState = mongoose.connection.readyState;

        // If connecting, wait to see if it becomes connected or disconnected
        if (dbState === 2) {
            const becameConnected = await waitForConnection();
            // Re-check state after wait
            dbState = becameConnected ? 1 : mongoose.connection.readyState;
        }

        // If still not connected after waiting (or was disconnected/disconnecting), return 503
        if (dbState !== 1) {
            return res.status(503).json({
                status: 'error',
                message: 'Database is not connected',
                data: {
                    database: states[dbState] || 'unknown',
                    uptime: process.uptime(),
                    uptime_hours: (process.uptime() / 3600).toFixed(2),
                },
            });
        }

        // Ping is lightweight and fast — replaces expensive serverStatus()
        const pingResult = await mongoose.connection.db
            .admin()
            .ping();

        const dbName = mongoose.connection.db.databaseName;

        // Stats with a 3-second timeout using Promise.race
        const statsPromise = mongoose.connection.db.stats();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('stats timed out')), 3000)
        );
        const stats = await Promise.race([statsPromise, timeoutPromise]).catch(
            () => null
        );

        res.json({
            status: 'success',
            message: 'Server is running',
            data: {
                database: states[dbState],
                db_Name: dbName,
                ping: pingResult.ok === 1 ? 'ok' : 'fail',
                uptime: process.uptime(),
                uptime_hours: (process.uptime() / 3600).toFixed(2),
                collections: stats?.collections ?? null,
                documents: stats?.objects ?? null,
                indexes: stats?.indexes ?? null,
                data_size: stats?.dataSize
                    ? (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB'
                    : null,
                storage_size: stats?.storageSize
                    ? (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB'
                    : null,
            },
        });
    } catch (err) {
        next(err);
    }
});

// Create Product
app.post("/api/products", async (req, res) => {
    try {
        await connectDB();
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
        await connectDB();
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Product By Id
app.get("/api/products/:id", async (req, res) => {
    try {
        await connectDB();
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
        await connectDB();
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
        await connectDB();
        const result = await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// MongoDB Connection CronJob
app.get("/api/db-heartbeat", cronAuth, async (req, res) => {
    try {
        // Ensure MongoDB connection is established (uses global cache on warm starts)
        await connectDB();

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


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
module.exports = app;