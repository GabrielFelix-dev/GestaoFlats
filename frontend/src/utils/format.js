export function formatCurrency(value) {
  const number = Number(value);

  return (Number.isFinite(number) ? number : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// As datas de check-in/check-out, vencimento e lançamento são gravadas pelo
// backend como meia-noite UTC (YYYY-MM-DDT00:00:00.000Z). Formatar no fuso
// local deslocaria o dia em fusos negativos como o do Brasil, então essas
// datas são exibidas explicitamente em UTC.
export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00.000Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00.000Z`).getTime();
  const diff = Math.round((end - start) / 86400000);

  return diff > 0 ? diff : 0;
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
