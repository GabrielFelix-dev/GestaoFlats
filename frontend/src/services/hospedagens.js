import { request } from "./api";

export const hospedagensService = {
  async list(filters) {
    const { hospedagens } = await request("/hospedagens", { params: filters });
    return hospedagens;
  },

  async getById(id) {
    const { hospedagem } = await request(`/hospedagens/${id}`);
    return hospedagem;
  },

  async create(data) {
    const { hospedagem } = await request("/hospedagens", {
      method: "POST",
      body: data,
    });
    return hospedagem;
  },

  async update(id, data) {
    const { hospedagem } = await request(`/hospedagens/${id}`, {
      method: "PUT",
      body: data,
    });
    return hospedagem;
  },

  async changeStatus(id, status) {
    const { hospedagem } = await request(`/hospedagens/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
    return hospedagem;
  },

  async remove(id) {
    await request(`/hospedagens/${id}`, { method: "DELETE" });
  },
};

export default hospedagensService;
