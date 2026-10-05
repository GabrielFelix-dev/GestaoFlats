import { request } from "./api";

export const financeiroService = {
    async rentabilidade(filters) {
        return request("/financeiro/rentabilidade", { params: filters });
    },
};

export default financeiroService;