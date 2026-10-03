import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, "..", "..");

dotenv.config({ path: path.resolve(backendRoot, ".env") });

function required(key, fallback) {
  const value = process.env[key] ?? fallback;

  if (value === undefined || value === "") {
    throw new Error(`Variavel de ambiente obrigatória ausente: ${key}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3333),
  mongoUri: required(
    "MONGODB_URI",
    "mongodb://127.0.0.1:27017/gestaoflats",
  ),
  jwt: {
    secret: required("JWT_SECRET", "desenvolvimento-secret"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
};

export default env;