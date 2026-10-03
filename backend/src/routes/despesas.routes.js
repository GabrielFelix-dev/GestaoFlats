import { Router } from "express";
import despesaController from "../controllers/despesa.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, validateObjectId } from "../middlewares/validate.middleware.js";
import {
  createDespesaSchema,
  despesaQuerySchema,
  despesaStatusSchema,
  updateDespesaSchema,
} from "../schemas/despesa.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(despesaQuerySchema, "query"), despesaController.index);
router.get("/:id", validateObjectId(), despesaController.show);
router.post("/", validate(createDespesaSchema), despesaController.store);
router.put("/:id", validateObjectId(), validate(updateDespesaSchema), despesaController.update);
router.patch(
  "/:id/status",
  validateObjectId(),
  validate(despesaStatusSchema),
  despesaController.changeStatus,
);
router.delete("/:id", validateObjectId(), despesaController.destroy);

export default router;