import { Router } from "express";
import cepController from "../controllers/cep.controller.js";

const router = Router();

router.get("/:cep", cepController);

export default router;