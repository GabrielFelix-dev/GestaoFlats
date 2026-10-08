import "./Alert.css";

export default function Alert({ type = "error", message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="status">
      <span className="alert-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Fechar aviso"
        >
          ×
        </button>
      )}
    </div>
  );
}
