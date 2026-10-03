import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import acomodacoesRoutes from "./routes/acomodacoes.routes.js";
import checkinCheckoutRoutes from "./routes/checkinCheckout.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import despesasRoutes from "./routes/despesas.routes.js";
import hospedagensRoutes from "./routes/hospedagens.routes.js";
import hospedesRoutes from "./routes/hospedes.routes.js";
import receitasRoutes from "./routes/receitas.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl.split(",").map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (!env.isProduction) {
    app.use(morgan("dev"));
  }

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", ambiente: env.nodeEnv });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/hospedes", hospedesRoutes);
  app.use("/api/acomodacoes", acomodacoesRoutes);
  app.use("/api/hospedagens", hospedagensRoutes);
  app.use("/api/checkin-checkout", checkinCheckoutRoutes);
  app.use("/api/receitas", receitasRoutes);
  app.use("/api/despesas", despesasRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;