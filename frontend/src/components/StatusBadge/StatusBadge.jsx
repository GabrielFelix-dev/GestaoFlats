import { statusLabel } from "../../utils/labels";
import "./StatusBadge.css";

const TONE_BY_STATUS = {
  Confirmada: "info",
  Ativa: "success",
  Disponivel: "success",
  Ativo: "success",
  Recebido: "success",
  Pago: "success",
  Concluida: "neutral",
  Inativa: "muted",
  Inativo: "muted",
  Cancelada: "danger",
  Cancelado: "danger",
  Atrasado: "danger",
  Manutencao: "warning",
  EmManutencao: "warning",
  Pendente: "warning",
  Ocupada: "info",
};

export default function StatusBadge({ status, label }) {
  const tone = TONE_BY_STATUS[status] ?? "neutral";

  return (
    <span className={`status-badge status-badge-${tone}`}>
      {label ?? statusLabel(status)}
    </span>
  );
}
