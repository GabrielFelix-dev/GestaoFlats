// Máscaras de CPF e telefone. Os separadores são apenas de exibição: o valor
// enviado à API e gravado no banco contém apenas dígitos, para que a busca por
// CPF e o índice único do campo não dependam da pontuação digitada. Por isso a
// mesma função serve para mascarar a digitação e para formatar o que veio do
// banco.

export function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function maskCpf(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function maskTelefone(value) {
  const digits = onlyDigits(value).slice(0, 11);
  const comDdd = digits.replace(/^(\d{2})(\d)/, "($1) $2");

  if (digits.length <= 10) {
    return comDdd.replace(/^(\(\d{2}\) \d{4})(\d{1,4})$/, "$1-$2");
  }

  return comDdd.replace(/^(\(\d{2}\) \d{5})(\d{1,4})$/, "$1-$2");
}

export const masks = {
  cpf: maskCpf,
  telefone: maskTelefone,
};

// A busca de hóspedes casa o termo com nome, e-mail e CPF. Quando o termo traz
// apenas dígitos e a pontuação de um documento, os separadores são removidos
// para casar com o CPF gravado sem formatação.
export function normalizeSearchTerm(term) {
  const value = String(term ?? "").trim();

  if (!value || /[^\d\s().-]/.test(value)) return value;

  return onlyDigits(value) || value;
}