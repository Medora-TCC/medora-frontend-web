import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { AlertTriangle, MapPin, Pencil, Plus } from "lucide-react";
import { FieldWrapper } from "@medora_web/shared";
import { InfoCard, InfoGrid, InfoItem } from "../../../../components/Profile/InfoCard";
import { getDoctorAddress, updateDoctorAddress } from "../../../../api/services/DoctorService";
import type { DoctorAddressDto, DoctorAddressRequestDto } from "../../../../api/dtos/Doctors/DoctorAddressDto";
import { BRAZIL_STATES, onlyDigits } from "../../../../api/mappers/personLabels";
import { lookupCep } from "./cepLookup";
import {
  ADDRESS_LIMITS,
  formatCep,
  isCepComplete,
  normalizeNumber,
  normalizeSpaces,
  validateAddress,
  type AddressField,
  type AddressForm,
  type CepStatus,
} from "./addressValidation";

const EMPTY_FORM: AddressForm = {
  postalCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

// ordem do formulário, para levar o foco ao primeiro campo com erro
const FIELD_ORDER: AddressField[] = ["postalCode", "street", "number", "complement", "neighborhood", "city", "state"];

const fieldId = (field: AddressField) => `doctor-address-${field}`;

function toForm(address: DoctorAddressDto | null): AddressForm {
  if (!address) return EMPTY_FORM;
  return {
    postalCode: formatCep(address.postalCode),
    street: address.street,
    number: address.number,
    complement: address.complement ?? "",
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
  };
}

function toPayload(form: AddressForm): DoctorAddressRequestDto {
  return {
    postalCode: onlyDigits(form.postalCode),
    street: normalizeSpaces(form.street),
    number: normalizeNumber(form.number),
    complement: normalizeSpaces(form.complement) || null,
    neighborhood: normalizeSpaces(form.neighborhood),
    city: normalizeSpaces(form.city),
    state: form.state,
  };
}

function isSameAddress(payload: DoctorAddressRequestDto, address: DoctorAddressDto): boolean {
  return (
    payload.postalCode === address.postalCode &&
    payload.street === address.street &&
    payload.number === address.number &&
    payload.complement === (address.complement || null) &&
    payload.neighborhood === address.neighborhood &&
    payload.city === address.city &&
    payload.state === address.state
  );
}

// "typed": o médico digitou um CEP novo, então rua e bairro vêm do CEP.
// "verify": só confere o CEP já salvo ao abrir a edição, sem mexer na rua e no bairro dele.
type LookupMode = "typed" | "verify";

const inputClass = (hasError: boolean, locked = false) =>
  [hasError ? "border-danger" : "", locked ? "opacity-70 cursor-not-allowed" : ""].filter(Boolean).join(" ");

const selectClass = (hasError: boolean, locked: boolean) =>
  [
    "w-full h-10 px-3 rounded-lg border bg-surface text-text-primary text-sm",
    hasError ? "border-danger" : "border-border",
    locked ? "opacity-70 cursor-not-allowed" : "",
  ].join(" ");

export default function AddressCard() {
  const [address, setAddress] = useState<DoctorAddressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [cepStatus, setCepStatus] = useState<CepStatus>({ kind: "idle" });
  // os erros dos campos só aparecem depois da primeira tentativa de salvar
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const lookupController = useRef<AbortController | null>(null);
  // o que o CEP preencheu por último: trocar de CEP limpa isso, mas não o que o médico digitou
  const autoFilled = useRef({ street: "", neighborhood: "" });
  const numberInput = useRef<HTMLInputElement>(null);

  const loadAddress = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setAddress(await getDoctorAddress());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Erro ao carregar o endereço.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddress();
  }, [loadAddress]);

  // não deixa consulta de CEP pendente ao sair da tela
  useEffect(() => () => lookupController.current?.abort(), []);

  const cancelLookup = () => {
    lookupController.current?.abort();
    lookupController.current = null;
  };

  const runLookup = async (cep: string, mode: LookupMode) => {
    cancelLookup();
    const controller = new AbortController();
    lookupController.current = controller;
    setCepStatus({ kind: "loading", cep });

    let result;
    try {
      result = await lookupCep(cep, controller.signal);
    } catch {
      return; // o CEP mudou antes da resposta
    }
    if (lookupController.current !== controller) return;
    lookupController.current = null;

    if (result.kind !== "found") {
      setCepStatus({ kind: result.kind, cep });
      return;
    }

    setCepStatus({ kind: "found", cep, city: result.city, state: result.state, hasStreet: !!result.street });
    setForm((prev) => {
      const next = { ...prev, city: result.city, state: result.state };
      if (mode === "typed") {
        // CEP geral da cidade não traz rua nem bairro: apaga só o que veio do CEP anterior
        next.street = result.street || (prev.street === autoFilled.current.street ? "" : prev.street);
        next.neighborhood =
          result.neighborhood || (prev.neighborhood === autoFilled.current.neighborhood ? "" : prev.neighborhood);
        autoFilled.current = { street: result.street, neighborhood: result.neighborhood };
      }
      return next;
    });

    if (mode === "typed" && result.street) numberInput.current?.focus();
  };

  const setField = <K extends AddressField>(key: K, value: AddressForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    const previousDigits = onlyDigits(form.postalCode);
    setField("postalCode", formatted);

    const cep = onlyDigits(formatted);
    if (cep === previousDigits) return;

    // CEP incompleto ou do tipo 00000000 nem vai para o ViaCEP; o validador explica o erro
    if (isCepComplete(cep) && !/^(\d)\1{7}$/.test(cep)) {
      runLookup(cep, "typed");
    } else {
      cancelLookup();
      setCepStatus({ kind: "idle" });
    }
  };

  const startEditing = () => {
    setForm(toForm(address));
    setShowErrors(false);
    setSaveError("");
    setCepStatus({ kind: "idle" });
    autoFilled.current = { street: "", neighborhood: "" };
    setIsEditing(true);
    if (address && isCepComplete(address.postalCode)) runLookup(onlyDigits(address.postalCode), "verify");
  };

  const cancelEditing = () => {
    cancelLookup();
    setSaveError("");
    setIsEditing(false);
  };

  const errors = useMemo(() => validateAddress(form, cepStatus), [form, cepStatus]);

  // CEP inexistente aparece na hora; os outros erros só depois de tentar salvar
  const errorFor = (field: AddressField): string | undefined => {
    if (showErrors) return errors[field];
    if (field === "postalCode" && cepStatus.kind === "notFound") return errors.postalCode;
    return undefined;
  };

  const handleSave = async () => {
    if (cepStatus.kind === "loading") return;

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      setShowErrors(true);
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    const payload = toPayload(form);
    // nada mudou: só fecha. Sem coordenadas, salva mesmo assim para tentar localizar de novo
    if (address && address.located && isSameAddress(payload, address)) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      setAddress(await updateDoctorAddress(payload));
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível salvar o endereço.");
    } finally {
      setIsSaving(false);
    }
  };

  const cityStateLocked = cepStatus.kind === "found";

  const cepHint = (): ReactNode => {
    switch (cepStatus.kind) {
      case "loading":
        return (
          <span className="flex items-center gap-1.5">
            <Spinner size="sm" /> Buscando CEP...
          </span>
        );
      case "found":
        return cepStatus.hasStreet
          ? "Endereço preenchido pelo CEP. Confira e informe o número."
          : "CEP geral da cidade: informe a rua e o bairro.";
      case "unavailable":
        return (
          <span className="text-warning-text">
            Não foi possível consultar o CEP agora. Preencha o endereço manualmente ou{" "}
            <button
              type="button"
              className="underline font-medium"
              onClick={() => runLookup(cepStatus.cep, "typed")}
            >
              tente de novo
            </button>
            .
          </span>
        );
      default:
        return "Digite o CEP para preencher o endereço.";
    }
  };

  const describe = (field: AddressField, hint?: ReactNode): ReactNode => {
    const error = errorFor(field);
    if (error) return <span className="text-danger-text">{error}</span>;
    return hint;
  };

  const renderForm = () => (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
          <FieldWrapper label="CEP" description={describe("postalCode", cepHint())}>
            <Input
              id={fieldId("postalCode")}
              value={form.postalCode}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={9}
              aria-invalid={!!errorFor("postalCode")}
              className={inputClass(!!errorFor("postalCode"))}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="Rua" description={describe("street")}>
          <Input
            id={fieldId("street")}
            value={form.street}
            onChange={(e) => setField("street", e.target.value)}
            autoComplete="address-line1"
            maxLength={ADDRESS_LIMITS.street}
            aria-invalid={!!errorFor("street")}
            className={inputClass(!!errorFor("street"))}
          />
        </FieldWrapper>

        <FieldWrapper label="Número" description={describe("number", "Sem número? Use S/N.")}>
          <Input
            id={fieldId("number")}
            ref={numberInput}
            value={form.number}
            onChange={(e) => setField("number", e.target.value)}
            maxLength={ADDRESS_LIMITS.number}
            aria-invalid={!!errorFor("number")}
            className={inputClass(!!errorFor("number"))}
          />
        </FieldWrapper>

        <FieldWrapper label="Complemento" description={describe("complement")}>
          <Input
            id={fieldId("complement")}
            value={form.complement}
            onChange={(e) => setField("complement", e.target.value)}
            placeholder="Opcional (sala, andar...)"
            autoComplete="address-line2"
            maxLength={ADDRESS_LIMITS.complement}
            aria-invalid={!!errorFor("complement")}
            className={inputClass(!!errorFor("complement"))}
          />
        </FieldWrapper>

        <FieldWrapper label="Bairro" description={describe("neighborhood")}>
          <Input
            id={fieldId("neighborhood")}
            value={form.neighborhood}
            onChange={(e) => setField("neighborhood", e.target.value)}
            maxLength={ADDRESS_LIMITS.neighborhood}
            aria-invalid={!!errorFor("neighborhood")}
            className={inputClass(!!errorFor("neighborhood"))}
          />
        </FieldWrapper>

        <FieldWrapper label="Cidade" description={describe("city", cityStateLocked ? "Definida pelo CEP." : undefined)}>
          <Input
            id={fieldId("city")}
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
            readOnly={cityStateLocked}
            autoComplete="address-level2"
            maxLength={ADDRESS_LIMITS.city}
            aria-invalid={!!errorFor("city")}
            className={inputClass(!!errorFor("city"), cityStateLocked)}
          />
        </FieldWrapper>

        <FieldWrapper label="Estado" description={describe("state", cityStateLocked ? "Definido pelo CEP." : undefined)}>
          <select
            id={fieldId("state")}
            value={form.state}
            onChange={(e) => setField("state", e.target.value)}
            disabled={cityStateLocked}
            aria-invalid={!!errorFor("state")}
            className={selectClass(!!errorFor("state"), cityStateLocked)}
          >
            <option value="">Selecione</option>
            {BRAZIL_STATES.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </FieldWrapper>
      </div>

      {saveError && (
        <p className="text-xs text-danger-text flex items-center gap-1.5">
          <AlertTriangle size={13} /> {saveError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onPress={cancelEditing} isDisabled={isSaving}>
          Cancelar
        </Button>
        <Button size="sm" variant="primary" type="submit" isDisabled={isSaving || cepStatus.kind === "loading"}>
          {isSaving ? <Spinner color="current" size="sm" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-4 flex justify-center"><Spinner size="sm" /></div>;
    }

    if (loadError) {
      return (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-danger-text flex items-center gap-1.5">
            <AlertTriangle size={14} /> {loadError}
          </p>
          <Button size="sm" variant="outline" onPress={loadAddress}>Tentar novamente</Button>
        </div>
      );
    }

    if (isEditing) return renderForm();

    if (!address) {
      return (
        <p className="text-sm text-text-muted">
          Nenhum endereço cadastrado. Sem ele, você não aparece na busca por médicos próximos no app.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <InfoGrid>
          <InfoItem label="Endereço" value={`${address.street}, ${address.number}`} />
          <InfoItem label="Complemento" value={address.complement} />
          <InfoItem label="Bairro" value={address.neighborhood} />
          <InfoItem label="Cidade" value={`${address.city} - ${address.state}`} />
          <InfoItem label="CEP" value={formatCep(address.postalCode)} />
        </InfoGrid>
        {!address.located && (
          <p className="text-xs text-warning-text flex items-center gap-1.5">
            <AlertTriangle size={13} />
            Não conseguimos localizar este endereço no mapa agora, então você ainda não aparece na busca por distância.
            Tente salvar de novo mais tarde.
          </p>
        )}
      </div>
    );
  };

  return (
    <InfoCard
      icon={<MapPin size={18} />}
      title="Endereço do consultório"
      description="Aparece no seu perfil e é usado para os pacientes encontrarem médicos próximos."
      action={
        !isLoading && !loadError && !isEditing && (
          <Button size="sm" variant="outline" onPress={startEditing}>
            {address ? <Pencil size={14} /> : <Plus size={14} />}
            {address ? "Editar" : "Adicionar"}
          </Button>
        )
      }
    >
      {renderContent()}
    </InfoCard>
  );
}
