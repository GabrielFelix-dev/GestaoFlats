import { Router } from "express";
import { z } from "zod";
import receitaController from "../controllers/receita.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, validateObjectId } from "../middlewares/validate.middleware.js";
import {
  createReceitaSchema,
  receitaQuerySchema,
  updateReceitaSchema,
} from "../schemas/receita.schema.js";

const statusSchema = z.object({
  status: z.enum(["Pendente", "Recebido", "Cancelado"]),
});

const router = Router();

router.use(authenticate);

router.get("/", validate(receitaQuerySchema, "query"), receitaController.index);
router.get("/:id", validateObjectId(), receitaController.show);
router.post("/", validate(createReceitaSchema), receitaController.store);
router.put("/:id", validateObjectId(), validate(updateReceitaSchema), receitaController.update);
router.patch(
  "/:id/status",
  validateObjectId(),
  validate(statusSchema),
  receitaController.changeStatus,
);
router.delete("/:id", validateObjectId(), receitaController.destroy);

export default router;