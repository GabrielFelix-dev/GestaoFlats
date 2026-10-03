import { Router } from "express";
import { z } from "zod";
import acomodacaoController from "../controllers/acomodacao.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, validateObjectId } from "../middlewares/validate.middleware.js";
import {
  acomodacaoQuerySchema,
  createAcomodacaoSchema,
  updateAcomodacaoSchema,
} from "../schemas/acomodacao.schema.js";

const statusSchema = z.object({
  status: z.enum(["Disponivel", "Ocupada", "Manutencao", "Inativa"]),
});

const router = Router();

router.use(authenticate);

router.get("/", validate(acomodacaoQuerySchema, "query"), acomodacaoController.index);
router.get("/:id", validateObjectId(), acomodacaoController.show);
router.post("/", validate(createAcomodacaoSchema), acomodacaoController.store);
router.put(
  "/:id",
  validateObjectId(),
  validate(updateAcomodacaoSchema),
  acomodacaoController.update,
);
router.patch(
  "/:id/status",
  validateObjectId(),
  validate(statusSchema),
  acomodacaoController.changeStatus,
);
router.delete("/:id", validateObjectId(), acomodacaoController.destroy);

export default router;