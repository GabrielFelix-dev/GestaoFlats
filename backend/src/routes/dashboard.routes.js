import { Router } from "express";
import { z } from "zod";
import dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { dateRangeBaseSchema } from "../schemas/common.schema.js";

const historicoQuerySchema = dateRangeBaseSchema.extend({
  status: z.enum(["Confirmada", "Ativa", "Concluida", "Cancelada", "EmManutencao"]).optional(),
});

const router = Router();

router.use(authenticate);

router.get(
  "/resumo",
  validate(dateRangeBaseSchema, "query"),
  dashboardController.resumo,
);
router.get("/historico", validate(historicoQuerySchema, "query"), dashboardController.historico);

export default router;