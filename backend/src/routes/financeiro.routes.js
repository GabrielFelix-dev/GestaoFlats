import { Router } from "express";
import { z } from "zod";
import financeiroController from "../controllers/financeiro.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { dateRangeBaseSchema, idParam } from "../schemas/common.schema.js";

const rentabilidadeQuerySchema = dateRangeBaseSchema
    .extend({
        acomodacaoId: idParam.optional(),
        bairro: z.string().trim().min(1).max(80).optional(),
    })
    .superRefine((data, context) => {
        if (data.dataInicial && data.dataFinal && data.dataFinal < data.dataInicial) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A data final deve ser igual ou posterior à inicial.",
                path: ["dataFinal"],
            });
        }
    });

const router = Router();

router.use(authenticate);
router.get(
    "/rentabilidade",
    validate(rentabilidadeQuerySchema, "query"),
    financeiroController.rentabilidade,
);

export default router;