import mongoose from "mongoose";
import env from "./env.js";

mongoose.set("strictQuery", true);

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;

  mongoose.connection.on("error", (error) => {
    console.error("Erro na conexão com o MongoDB:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
  });

  console.log("Conectado ao MongoDB");

  return mongoose.connection;
}

export async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
  }
}

export default connectDatabase;