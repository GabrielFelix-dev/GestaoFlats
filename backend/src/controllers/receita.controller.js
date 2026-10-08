import receitaService from "../services/receita.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const receitaController = {
  index: asyncHandler(async (req, res) => {
    const receitas = await receitaService.list(req.validatedQuery ?? {});

    res.status(200).json({ receitas, total: receitas.length });
  }),

  show: asyncHandler(async (req, res) => {
    const receita = await receitaService.getById(req.params.id);

    res.status(200).json({ receita });
  }),

  store: asyncHandler(async (req, res) => {
    const receita = await receitaService.create(req.body);

    res.status(201).json({ receita });
  }),

  update: asyncHandler(async (req, res) => {
    const receita = await receitaService.update(req.params.id, req.body);

    res.status(200).json({ receita });
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const receita = await receitaService.changeStatus(req.params.id, req.body.status);

    res.status(200).json({ receita });
  }),

  destroy: asyncHandler(async (req, res) => {
    await receitaService.remove(req.params.id);

    res.status(204).send();
  }),
};

export default receitaController;