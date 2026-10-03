import { request } from "./api";

export const despesasService = {
  async list(filters) {
    const { despesas } = await request("/despesas", { params: filters });
    return despesas;
  },

  async getById(id) {
    const { despesa } = await request(`/despesas/${id}`);
    return despesa;
  },

  async create(data) {
    const { despesa } = await request("/despesas", { method: "POST", body: data });
    return despesa;
  },

  async update(id, data) {
    const { despesa } = await request(`/despesas/${id}`, {
      method: "PUT",
      body: data,
    });
    return despesa;
  },

  async changeStatus(id, status, dataPagamento) {
    const { despesa } = await request(`/despesas/${id}/status`, {
      method: "PATCH",
      body: dataPagamento ? { status, dataPagamento } : { status },
    });
    return despesa;
  },

  async remove(id) {
    await request(`/despesas/${id}`, { method: "DELETE" });
  },
};

export default despesasService;
