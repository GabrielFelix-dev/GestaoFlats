import React, { useEffect, useMemo, useState } from "react";
import "./CalendarPicker.css";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthDays(year, month) {
  const primeiroDia = new Date(Date.UTC(year, month, 1));
  const ultimoDia = new Date(Date.UTC(year, month + 1, 0));
  const diasNoMes = ultimoDia.getUTCDate();
  const diaSemanaInicio = primeiroDia.getUTCDay();

  const dias = [];
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(null);
  }
  for (let d = 1; d <= diasNoMes; d++) {
    dias.push(new Date(Date.UTC(year, month, d)));
  }
  return dias;
}

export default function CalendarPicker({
  label,
  name,
  value,
  onChange,
  diasComCheckIn = [],
  diasComCheckOut = [],
  diasLivres = [],
  diasParciais = [],
  diasLotados = [],
  disabled,
  minDate,
  maxDate,
  required,
  placeholder = "Selecione uma data",
  showLegend = false,
  legendLabels = { livre: "Livre", parcial: "Parcial", lotado: "Lotado" },
  variant = "default", // "default" | "availability"
  onViewMonthChange,
}) {
  const [visible, setVisible] = useState(false);
  const [viewYear, setViewYear] = useState(() => (value ? new Date(value).getUTCFullYear() : new Date().getUTCFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (value ? new Date(value).getUTCMonth() : new Date().getUTCMonth()));
  const [hoveredDate, setHoveredDate] = useState(null);

  const today = useMemo(() => new Date(), []);
  today.setUTCHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(value) : null;

  const diasCheckInSet = useMemo(() => new Set(diasComCheckIn), [diasComCheckIn]);
  const diasCheckOutSet = useMemo(() => new Set(diasComCheckOut), [diasComCheckOut]);
  const diasLivresSet = useMemo(() => new Set(diasLivres), [diasLivres]);
  const diasParciaisSet = useMemo(() => new Set(diasParciais), [diasParciais]);
  const diasLotadosSet = useMemo(() => new Set(diasLotados), [diasLotados]);

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  // Notify parent when viewed month changes
  useEffect(() => {
    if (onViewMonthChange) {
      onViewMonthChange(viewYear, viewMonth);
    }
  }, [viewYear, viewMonth, onViewMonthChange]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pickerRef = React.useRef(null);

  function prevMonth() {
    setViewMonth((m) => (m === 0 ? (setViewYear((y) => y - 1), 11) : m - 1));
  }

  function nextMonth() {
    setViewMonth((m) => (m === 11 ? (setViewYear((y) => y + 1), 0) : m + 1));
  }

  function handleDayClick(date) {
    if (isDayDisabled(date)) return;
    onChange(formatDateKey(date));
    setVisible(false);
  }

  function isDayDisabled(date) {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  }

  function isToday(date) {
    return date.getTime() === today.getTime();
  }

  function isSelected(date) {
    return selectedDate && date.getTime() === selectedDate.getTime();
  }

  function hasCheckIn(date) {
    return diasCheckInSet.has(formatDateKey(date));
  }

  function hasCheckOut(date) {
    return diasCheckOutSet.has(formatDateKey(date));
  }

  function getDayStatus(date) {
    const key = formatDateKey(date);
    if (variant === "availability") {
      if (diasLivresSet.has(key)) return "livre";
      if (diasParciaisSet.has(key)) return "parcial";
      if (diasLotadosSet.has(key)) return "lotado";
      return "none";
    }
    const checkin = diasCheckInSet.has(key);
    const checkout = diasCheckOutSet.has(key);
    if (checkin && checkout) return "both";
    if (checkin) return "checkin";
    if (checkout) return "checkout";
    return "none";
  }

  function getTooltip(date) {
    const status = getDayStatus(date);
    if (variant === "availability") {
      if (status === "livre") return legendLabels.livre;
      if (status === "parcial") return legendLabels.parcial;
      if (status === "lotado") return legendLabels.lotado;
      return "Sem informação";
    }
    if (status === "checkin") return "Check-in";
    if (status === "checkout") return "Check-out";
    if (status === "both") return "Check-in e Check-out";
    return "";
  }

  return (
    <div className="calendar-picker" ref={pickerRef}>
      {label && (
        <label htmlFor={`calendar-input-${name || "default"}`} className="calendar-label">
          {label}
          {required && <span aria-hidden="true">*</span>}
        </label>
      )}
      {name && (
        <input
          type="hidden"
          id={`calendar-input-${name}`}
          name={name}
          value={value ?? ""}
          readOnly
        />
      )}
      <div
        id={`calendar-input-${name || "default"}`}
        className={`calendar-input ${visible ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setVisible(!visible)}
      >
        <span className="calendar-input-value">
          {value ? formatDateKey(new Date(value)).split("-").reverse().join("/") : placeholder}
        </span>
        <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {visible && !disabled && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" className="calendar-nav" onClick={prevMonth} aria-label="Mês anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="calendar-title" onClick={() => setVisible(false)}>
              <span className="calendar-month">{MESES[viewMonth]}</span>
              <span className="calendar-year">{viewYear}</span>
            </div>
            <button type="button" className="calendar-nav" onClick={nextMonth} aria-label="Próximo mês">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="calendar-weekdays">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="calendar-weekday">{dia}</div>
            ))}
          </div>

          <div className="calendar-days">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }
              const key = formatDateKey(date);
              const status = getDayStatus(date);
              const tooltip = getTooltip(date);
              return (
                <button
                  key={key}
                  type="button"
                  className={`calendar-day ${isToday(date) ? "today" : ""} ${isSelected(date) ? "selected" : ""} ${isDayDisabled(date) ? "disabled" : ""} ${status !== "none" ? `status-${status}` : ""} ${variant === "availability" ? "availability-variant" : ""}`}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => setHoveredDate(key)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={isDayDisabled(date)}
                  aria-label={key}
                  aria-selected={isSelected(date)}
                  aria-disabled={isDayDisabled(date)}
                  title={tooltip || undefined}
                >
                  <span className="calendar-day-number">{date.getUTCDate()}</span>
                  {variant !== "availability" && (
                    <div className="calendar-day-indicators">
                      {hasCheckIn(date) && <span className="indicator checkin" title="Check-in" />}
                      {hasCheckOut(date) && <span className="indicator checkout" title="Check-out" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {showLegend && (
            <div className="calendar-legend">
              {variant === "availability" ? (
                <>
                  <div className="legend-item">
                    <span className="legend-color legend-livre" />
                    <span>{legendLabels.livre}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color legend-parcial" />
                    <span>{legendLabels.parcial}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color legend-lotado" />
                    <span>{legendLabels.lotado}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="legend-item">
                    <span className="legend-color legend-checkin" />
                    <span>{legendLabels.checkin}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color legend-checkout" />
                    <span>{legendLabels.checkout}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}