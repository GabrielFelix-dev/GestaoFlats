import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
      mensagem: "Conta criada com sucesso. Faça login para acessar o sistema.",
      user,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    res.status(200).json(result);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(req.user.id);

    res.status(200).json({ user });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({ user });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const user = await authService.changePassword(req.user.id, req.body);

    res.status(200).json({ mensagem: "Senha alterada com sucesso.", user });
  }),
};

export default authController;