import { Router } from "express";
import rateLimit from "express-rate-limit";
import authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas. Tente novamente em alguns minutos." },
});

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile,
);
router.put(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;