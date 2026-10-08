import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import { acomodacoesService, hospedagensService, hospedesService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useFeedback } from "../../../hooks/useFeedback";
import { countNights, formatCurrency, todayInputValue } from "../../../utils/format";
import { maskCpf, maskRg, maskCnh } from "../../../utils/mask";

function formatDocumento(hospede) {
  const tipo = hospede.documentoTipo;

  if (tipo === "RG") return maskRg(hospede.cpf);
  if (tipo === "CNH") return maskCnh(hospede.cpf);

  return maskCpf(hospede.cpf);
}
import { HOSPEDAGEM_STATUS, statusLabel, toOptions } from "../../../utils/labels";
import "./NovaHospedagem.css";

const emptyForm = {
  hospedeId: "",
  acomodacaoId: "",
  dataCheckIn: "",
  dataCheckOut: "",
  numeroHospedes: "1",
  valorDiaria: "",
  observacoes: "",
  status: "Confirmada",
};

export default function NovaHospedagem({ onNavigate }) {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isComDiariaManual, setIsComDiariaManual] = useState(false);
  const { feedback, clear, run } = useFeedback();

  const loadHospedes = useCallback(() => hospedesService.list({ status: "Ativo" }), []);
  const loadAcomodacoes = useCallback(() => acomodacoesService.list(), []);

  const hospedes = useApiResource(loadHospedes);
  const acomodacoes = useApiResource(loadAcomodacoes);

  const acomodacaoSelecionada = useMemo(
    () =>
      (acomodacoes.data ?? []).find(
        (item) => item.id === form.acomodacaoId,
      ) ?? null,
    [acomodacoes.data, form.acomodacaoId],
  );

  // A diária da acomodação é o padrão da API; só enviamos valor quando o
  // usuário sobrescrever, para não congelar o valor antigo no lançamento.
  useEffect(() => {
    if (acomodacaoSelecionada && !isComDiariaManual) {
      setForm((current) => ({
        ...current,
        valorDiaria: String(acomodacaoSelecionada.valorDiaria),
      }));
    }
  }, [acomodacaoSelecionada, isComDiariaManual]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (name === "valorDiaria") {
      setIsComDiariaManual(true);
    }
  }

  const dias = countNights(form.dataCheckIn, form.dataCheckOut);
  const valorDiaria = Number(form.valorDiaria) || 0;
  const valorTotal = dias * valorDiaria;
  const excedeCapacidade =
    acomodacaoSelecionada && Number(form.numeroHospedes) > acomodacaoSelecionada.capacidade;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      hospedeId: form.hospedeId,
      acomodacaoId: form.acomodacaoId,
      dataCheckIn: form.dataCheckIn,
      dataCheckOut: form.dataCheckOut,
      numeroHospedes: Number(form.numeroHospedes) || 1,
      status: form.status,
    };

    if (isComDiariaManual && valorDiaria > 0) {
      payload.valorDiaria = valorDiaria;
    }

    if (form.observacoes.trim()) {
      payload.observacoes = form.observacoes.trim();
    }

    const result = await run(() => hospedagensService.create(payload), {
      successMessage: "Hospedagem registrada com sucesso.",
      onSuccess: () => {
        setForm(emptyForm);
        setIsComDiariaManual(false);
        onNavigate?.("hospedagens");
      },
    });

    if (!result) setIsSaving(false);
  }

  const erroListagem = hospedes.error || acomodacoes.error;

  return (
    <div className="nova-hospedagem-page">
      <Card
        title="Nova Hospedagem"
        subtitle="Preencha os dados para registrar uma reserva"
      >
        <form className="nova-hospedagem-form" onSubmit={handleSubmit}>
          <Select
            label="Hóspede"
            name="hospedeId"
            value={form.hospedeId}
            onChange={handleChange}
            placeholder="Selecione o hóspede"
            required
            options={(hospedes.data ?? []).map((hospede) => ({
              value: hospede.id,
              label: `${hospede.nome} · ${formatDocumento(hospede)}`,
            }))}
          />

          <Select
            label="Acomodação"
            name="acomodacaoId"
            value={form.acomodacaoId}
            onChange={handleChange}
            placeholder="Selecione a acomodação"
            required
            options={(acomodacoes.data ?? []).map((acomodacao) => ({
              value: acomodacao.id,
              label: `${acomodacao.nome} · ${formatCurrency(
                acomodacao.valorDiaria,
              )} / diária`,
            }))}
          />

          <Input
            label="Data de check-in"
            type="date"
            name="dataCheckIn"
            min={todayInputValue()}
            value={form.dataCheckIn}
            onChange={handleChange}
            required
          />

          <Input
            label="Data de check-out"
            type="date"
            name="dataCheckOut"
            min={form.dataCheckIn || todayInputValue()}
            value={form.dataCheckOut}
            onChange={handleChange}
            required
          />

          <Input
            label="Número de hóspedes"
            type="number"
            name="numeroHospedes"
            min={1}
            max={acomodacaoSelecionada?.capacidade ?? 20}
            value={form.numeroHospedes}
            onChange={handleChange}
            required
          />

          <Input
            label="Valor da diária (R$)"
            type="number"
            name="valorDiaria"
            min={0}
            step="0.01"
            value={form.valorDiaria}
            onChange={handleChange}
            placeholder="0,00"
            helperText={
              acomodacaoSelecionada
                ? `Capacidade: ${acomodacaoSelecionada.capacidade} hóspede(s). O padrão vem do cadastro da acomodação.`
                : "Selecione uma acomodação para usar a diária padrão."
            }
            error={excedeCapacidade}
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={toOptions(HOSPEDAGEM_STATUS)}
          />

          <Input
            label="Observações"
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            placeholder="Informações adicionais (opcional)"
          />

          <div className="nova-hospedagem-summary">
            <div>
              <span>Diárias</span>
              <strong>{dias || "—"}</strong>
            </div>
            <div>
              <span>Valor total</span>
              <strong>{formatCurrency(valorTotal)}</strong>
            </div>
            <div>
              <span>Status inicial</span>
              <strong>{statusLabel(form.status)}</strong>
            </div>
          </div>

          {excedeCapacidade && (
            <Alert
              message={`A acomodação comporta ${acomodacaoSelecionada.capacidade} hóspede(s). Ajuste a quantidade ou escolha outra acomodação.`}
            />
          )}

          {erroListagem && <Alert message={erroListagem} />}
          {feedback && (
            <Alert
              type={feedback.type}
              message={feedback.message}
              onClose={clear}
            />
          )}

          <div className="nova-hospedagem-actions">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar reserva"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(emptyForm);
                setIsComDiariaManual(false);
                onNavigate?.("hospedagens");
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
