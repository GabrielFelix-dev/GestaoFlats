import dashboardService from "../services/dashboard.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const dashboardController = {
  resumo: asyncHandler(async (req, res) => {
    const resumo = await dashboardService.resumo(req.validatedQuery ?? {});

    res.status(200).json(resumo);
  }),

  historico: asyncHandler(async (req, res) => {
    const historico = await dashboardService.historico(req.validatedQuery ?? {});

    res.status(200).json(historico);
  }),
};

export default dashboardController;