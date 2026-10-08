import { request } from "./api";

export const dashboardService = {
  async resumo(filters) {
    return request("/dashboard/resumo", { params: filters });
  },

  async historico(filters) {
    const { registros } = await request("/dashboard/historico", {
      params: filters,
    });
    return registros;
  },
};

export default dashboardService;
