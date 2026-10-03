import { request } from "./api";

export const hospedesService = {
  async list(filters) {
    const { hospedes } = await request("/hospedes", { params: filters });
    return hospedes;
  },

  async getById(id) {
    const { hospede } = await request(`/hospedes/${id}`);
    return hospede;
  },

  async create(data) {
    const { hospede } = await request("/hospedes", { method: "POST", body: data });
    return hospede;
  },

  async update(id, data) {
    const { hospede } = await request(`/hospedes/${id}`, {
      method: "PUT",
      body: data,
    });
    return hospede;
  },

  async remove(id) {
    await request(`/hospedes/${id}`, { method: "DELETE" });
  },
};

export default hospedesService;
