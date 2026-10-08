import { Router } from "express";
import checkinCheckoutController from "../controllers/checkinCheckout.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, validateObjectId } from "../middlewares/validate.middleware.js";
import {
  checkinCheckoutQuerySchema,
  disponibilidadeQuerySchema,
  diasComMovimentoQuerySchema,
  diasComDisponibilidadeQuerySchema,
} from "../schemas/hospedagem.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(checkinCheckoutQuerySchema, "query"), checkinCheckoutController.index);
router.post("/:id/checkin", validateObjectId(), checkinCheckoutController.checkIn);
router.post("/:id/checkout", validateObjectId(), checkinCheckoutController.checkOut);
router.get(
  "/disponibilidade",
  validate(disponibilidadeQuerySchema, "query"),
  checkinCheckoutController.disponibilidade,
);
router.get(
  "/dias-com-movimento",
  validate(diasComMovimentoQuerySchema, "query"),
  checkinCheckoutController.diasComMovimento,
);
router.get(
  "/dias-com-disponibilidade",
  validate(diasComDisponibilidadeQuerySchema, "query"),
  checkinCheckoutController.diasComDisponibilidade,
);

export default router;