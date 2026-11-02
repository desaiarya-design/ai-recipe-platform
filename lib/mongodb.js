import mongoose from "mongoose";

const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mongodb")) {
    return process.env.DATABASE_URL;
  }
  return "mongodb://127.0.0.1:27017/ai-recipe-platform";
};

const MONGODB_URI = getMongoUri();


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB successfully");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    if (e.message && e.message.includes("ECONNREFUSED") && MONGODB_URI.includes("127.0.0.1")) {
      console.warn(
        "\n⚠️ [MongoDB] Cannot connect to local MongoDB at 127.0.0.1:27017.\n" +
        "   If you don't have MongoDB installed locally, please add a free MongoDB Atlas connection string\n" +
        "   to MONGODB_URI in frontend/.env\n"
      );
    } else {
      console.error("MongoDB connection error:", e.message || e);
    }
    throw e;
  }


  return cached.conn;
}
