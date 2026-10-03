import { Router } from "express";
import hospedagemController from "../controllers/hospedagem.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, validateObjectId } from "../middlewares/validate.middleware.js";
import {
  createHospedagemSchema,
  hospedagemQuerySchema,
  hospedagemStatusSchema,
  updateHospedagemSchema,
} from "../schemas/hospedagem.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(hospedagemQuerySchema, "query"), hospedagemController.index);
router.get("/:id", validateObjectId(), hospedagemController.show);
router.post("/", validate(createHospedagemSchema), hospedagemController.store);
router.put(
  "/:id",
  validateObjectId(),
  validate(updateHospedagemSchema),
  hospedagemController.update,
);
router.patch(
  "/:id/status",
  validateObjectId(),
  validate(hospedagemStatusSchema),
  hospedagemController.changeStatus,
);
router.delete("/:id", validateObjectId(), hospedagemController.destroy);

export default router;