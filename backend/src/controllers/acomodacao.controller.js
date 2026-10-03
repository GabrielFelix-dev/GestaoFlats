import acomodacaoService from "../services/acomodacao.service.js";
import { STATUS_ACOMODACAO, TIPO_ACOMODACAO } from "../utils/enums.js";
import asyncHandler from "../utils/asyncHandler.js";

export const acomodacaoController = {
  index: asyncHandler(async (req, res) => {
    const acomodacoes = await acomodacaoService.list(req.validatedQuery ?? {});

    res.status(200).json({
      acomodacoes,
      total: acomodacoes.length,
      opcoes: { status: STATUS_ACOMODACAO, tipo: TIPO_ACOMODACAO },
    });
  }),

  show: asyncHandler(async (req, res) => {
    const acomodacao = await acomodacaoService.getById(req.params.id);

    res.status(200).json({ acomodacao });
  }),

  store: asyncHandler(async (req, res) => {
    const acomodacao = await acomodacaoService.create(req.body);

    res.status(201).json({ acomodacao });
  }),

  update: asyncHandler(async (req, res) => {
    const acomodacao = await acomodacaoService.update(req.params.id, req.body);

    res.status(200).json({ acomodacao });
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const acomodacao = await acomodacaoService.changeStatus(req.params.id, req.body.status);

    res.status(200).json({ acomodacao });
  }),

  destroy: asyncHandler(async (req, res) => {
    await acomodacaoService.remove(req.params.id);

    res.status(204).send();
  }),
};

export default acomodacaoController;