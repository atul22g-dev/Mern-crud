const mongoose = require("mongoose");

const MONGO_URI = process.env.DATABASE;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  console.log("MongoDB Connected");

  return cached.conn;
}

connectDB();

module.exports = connectDB;