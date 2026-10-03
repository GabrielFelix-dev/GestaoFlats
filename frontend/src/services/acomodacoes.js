import { request } from "./api";

export const acomodacoesService = {
  async list(filters) {
    const { acomodacoes } = await request("/acomodacoes", { params: filters });
    return acomodacoes;
  },

  async getById(id) {
    const { acomodacao } = await request(`/acomodacoes/${id}`);
    return acomodacao;
  },

  async create(data) {
    const { acomodacao } = await request("/acomodacoes", {
      method: "POST",
      body: data,
    });
    return acomodacao;
  },

  async update(id, data) {
    const { acomodacao } = await request(`/acomodacoes/${id}`, {
      method: "PUT",
      body: data,
    });
    return acomodacao;
  },

  async changeStatus(id, status) {
    const { acomodacao } = await request(`/acomodacoes/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
    return acomodacao;
  },

  async remove(id) {
    await request(`/acomodacoes/${id}`, { method: "DELETE" });
  },
};

export default acomodacoesService;
