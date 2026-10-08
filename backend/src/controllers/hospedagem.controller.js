import hospedagemService from "../services/hospedagem.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const hospedagemController = {
  index: asyncHandler(async (req, res) => {
    const hospedagens = await hospedagemService.list(req.validatedQuery ?? {});

    res.status(200).json({ hospedagens, total: hospedagens.length });
  }),

  show: asyncHandler(async (req, res) => {
    const hospedagem = await hospedagemService.getById(req.params.id);

    res.status(200).json({ hospedagem });
  }),

  store: asyncHandler(async (req, res) => {
    const hospedagem = await hospedagemService.create(req.body);

    res.status(201).json({ hospedagem });
  }),

  update: asyncHandler(async (req, res) => {
    const hospedagem = await hospedagemService.update(req.params.id, req.body);

    res.status(200).json({ hospedagem });
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const hospedagem = await hospedagemService.changeStatus(req.params.id, req.body.status);

    res.status(200).json({ hospedagem });
  }),

  destroy: asyncHandler(async (req, res) => {
    await hospedagemService.remove(req.params.id);

    res.status(204).send();
  }),
};

export default hospedagemController;