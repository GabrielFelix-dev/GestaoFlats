import { request } from "./api";

export const checkinCheckoutService = {
  async list(filters) {
    return request("/checkin-checkout", { params: filters });
  },

  async checkIn(id) {
    const data = await request(`/checkin-checkout/${id}/checkin`, {
      method: "POST",
    });
    return data;
  },

  async checkOut(id) {
    const data = await request(`/checkin-checkout/${id}/checkout`, {
      method: "POST",
    });
    return data;
  },

  async disponibilidade(filters) {
    return request("/checkin-checkout/disponibilidade", { params: filters });
  },

  async diasComMovimento(mes) {
    return request("/checkin-checkout/dias-com-movimento", { params: { mes } });
  },

  async diasComDisponibilidade(mes, tipo) {
    return request("/checkin-checkout/dias-com-disponibilidade", { params: { mes, tipo } });
  },
};

export default checkinCheckoutService;
