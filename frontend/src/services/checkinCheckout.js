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
};

export default checkinCheckoutService;
