import { request } from "./api";

export const receitasService = {
  async list(filters) {
    const { receitas } = await request("/receitas", { params: filters });
    return receitas;
  },

  async getById(id) {
    const { receita } = await request(`/receitas/${id}`);
    return receita;
  },

  async create(data) {
    const { receita } = await request("/receitas", { method: "POST", body: data });
    return receita;
  },

  async update(id, data) {
    const { receita } = await request(`/receitas/${id}`, {
      method: "PUT",
      body: data,
    });
    return receita;
  },

  async changeStatus(id, status) {
    const { receita } = await request(`/receitas/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
    return receita;
  },

  async remove(id) {
    await request(`/receitas/${id}`, { method: "DELETE" });
  },
};

export default receitasService;
