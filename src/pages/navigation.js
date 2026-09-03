export const adminNavItems = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Hóspedes", value: "hospedes" },
  { label: "Acomodações", value: "acomodacoes" },
  { label: "Hospedagens", value: "hospedagens" },
  { label: "Disponibilidade", value: "disponibilidade" },
  { label: "Check-in / Check-out", value: "checkin-checkout" },
  { label: "Histórico", value: "historico" },
  {
    label: "Financeiro",
    value: "financeiro",
    children: [
      { label: "Receitas", value: "receitas" },
      { label: "Despesas", value: "despesas" },
      { label: "Resumo financeiro", value: "resumo-financeiro" },
    ],
  },
];