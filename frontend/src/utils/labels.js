export const ACOMODACAO_TIPOS = ["Flat", "Quarto", "Studio", "Apartamento"];

export const ACOMODACAO_STATUS = [
  "Disponivel",
  "Ocupada",
  "Manutencao",
  "Inativa",
];

export const HOSPEDAGEM_STATUS = [
  "Confirmada",
  "Ativa",
  "Concluida",
  "Cancelada",
  "EmManutencao",
];

export const RECEITA_STATUS = ["Pendente", "Recebido", "Cancelado"];

export const DESPESA_STATUS = ["Pendente", "Pago", "Atrasado", "Cancelado"];

export const HOSPEDE_STATUS = ["Ativo", "Inativo"];

export const DOCUMENTO_TIPOS = ["CPF", "Passaporte", "RG", "CNH"];

export const DESPESA_CATEGORIAS = [
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

// A API grava os enums sem acento para manter o banco consistente; a interface
// exibe a forma acentuada.
const LABELS = {
  Disponivel: "Disponível",
  Ocupada: "Ocupada",
  Manutencao: "Manutenção",
  Inativa: "Inativa",
  Confirmada: "Confirmada",
  Ativa: "Ativa",
  Concluida: "Concluída",
  Cancelada: "Cancelada",
  EmManutencao: "Em manutenção",
  Pendente: "Pendente",
  Recebido: "Recebido",
  Pago: "Pago",
  Atrasado: "Atrasado",
  Cancelado: "Cancelado",
  Ativo: "Ativo",
  Inativo: "Inativo",
};

const CATEGORIA_LABELS = {
  Manutencao: "Manutenção",
  Limpeza: "Limpeza",
  Condominio: "Condomínio",
  Energia: "Energia",
  Agua: "Água",
  Internet: "Internet",
  Marketing: "Marketing",
  Impostos: "Impostos",
  Outros: "Outros",
};

export function statusLabel(value) {
  return LABELS[value] ?? value ?? "—";
}

export function categoriaLabel(value) {
  if (!value) return "—";
  return CATEGORIA_LABELS[value] ?? value;
}

export function toOptions(values, formatter = statusLabel) {
  return values.map((value) => ({ value, label: formatter(value) }));
}
