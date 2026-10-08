import { Router } from "express";
import hospedeController from "../controllers/hospede.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, validateObjectId } from "../middlewares/validate.middleware.js";
import {
  createHospedeSchema,
  hospedeQuerySchema,
  updateHospedeSchema,
} from "../schemas/hospede.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(hospedeQuerySchema, "query"), hospedeController.index);
router.get("/:id", validateObjectId(), hospedeController.show);
router.post("/", validate(createHospedeSchema), hospedeController.store);
router.put("/:id", validateObjectId(), validate(updateHospedeSchema), hospedeController.update);
router.delete("/:id", validateObjectId(), hospedeController.destroy);

export default router;