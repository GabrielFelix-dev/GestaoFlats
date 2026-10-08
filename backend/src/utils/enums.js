export const STATUS_HOSPEDE = ["Ativo", "Inativo"];

export const DOCUMENTO_TIPOS = ["CPF", "Passaporte", "RG", "CNH"];

export const STATUS_HOSPEDE_FALLBACK = "Ativo";

export const normalizeStatusHospede = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "ativo" || normalized === "active") return "Ativo";
  if (normalized === "inativo" || normalized === "inactive") return "Inativo";

  return STATUS_HOSPEDE_FALLBACK;
};

export const STATUS_ACOMODACAO = ["Disponivel", "Ocupada", "Manutencao", "Inativa"];

export const STATUS_ACOMODACAO_FALLBACK = "Disponivel";

export const normalizeStatusAcomodacao = (value) => {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (normalized === "disponivel") return "Disponivel";
  if (normalized === "ocupada") return "Ocupada";
  if (normalized === "manutencao") return "Manutencao";
  if (normalized === "inativa") return "Inativa";

  return STATUS_ACOMODACAO_FALLBACK;
};

export const TIPO_ACOMODACAO = ["Flat", "Quarto", "Studio", "Apartamento"];

export const STATUS_HOSPEDAGEM = [
  "Confirmada",
  "Ativa",
  "Concluida",
  "Cancelada",
  "EmManutencao",
];

export const STATUS_HOSPEDAGEM_FALLBACK = "Confirmada";

export const normalizeStatusHospedagem = (value) => {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (normalized === "confirmada") return "Confirmada";
  if (normalized === "ativa" || normalized === "em_andamento") return "Ativa";
  if (normalized === "concluida") return "Concluida";
  if (normalized === "cancelada") return "Cancelada";
  if (normalized === "em_manutencao" || normalized === "manutencao") return "EmManutencao";

  return STATUS_HOSPEDAGEM_FALLBACK;
};

export const STATUS_RECEITA = ["Pendente", "Recebido", "Cancelado"];

export const STATUS_RECEITA_FALLBACK = "Pendente";

export const normalizeStatusReceita = (value) => {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (normalized === "pendente") return "Pendente";
  if (normalized === "recebido" || normalized === "pago") return "Recebido";
  if (normalized === "cancelado" || normalized === "cancelada") return "Cancelado";

  return STATUS_RECEITA_FALLBACK;
};

export const STATUS_DESPESA = ["Pendente", "Pago", "Atrasado", "Cancelado"];

export const STATUS_DESPESA_FALLBACK = "Pendente";

export const normalizeStatusDespesa = (value) => {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (normalized === "pendente") return "Pendente";
  if (normalized === "pago" || normalized === "paga") return "Pago";
  if (normalized === "atrasado" || normalized === "atrasada") return "Atrasado";
  if (normalized === "cancelado" || normalized === "cancelada") return "Cancelado";

  return STATUS_DESPESA_FALLBACK;
};

export const CATEGORIAS_DESPESA = [
  "Manutencao",
  "Limpeza",
  "Condominio",
  "Energia",
  "Agua",
  "Internet",
  "Marketing",
  "Impostos",
  "Outros",
];