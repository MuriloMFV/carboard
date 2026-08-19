import { useIonRouter } from '@ionic/react';
import { ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { CurrencyField, DateField, FormField, MileageField, SelectField, TextareaField } from '../../components/forms';
import { AttachmentButton } from '../../features/records/components/AttachmentButton';
import { FormActions } from '../../features/records/components/FormActions';
import { RecordFormSection } from '../../features/records/components/RecordFormSection';
import { RecordFormShell } from '../../features/records/components/RecordFormShell';
import { SuccessFeedback } from '../../features/records/components/SuccessFeedback';
import { createMaintenance } from '../../features/records/services/maintenance.service';
import { getTodayDate, parseDecimal, parseMileage } from '../../features/records/utils';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { formatDate, formatMileage, formatMonthYear } from '../../utils/formatters';

const buildSuggestion = (names: string[]) => {
  const normalized = names.map((name) => name.toLocaleLowerCase('pt-BR'));
  const oil = normalized.some((name) => name === 'óleo do motor');
  const oilFilter = normalized.some((name) => name === 'filtro de óleo');
  if (oil && oilFilter) return 'Troca de óleo + filtro';
  if (oil) return 'Troca de óleo';
  if (oilFilter) return 'Troca do filtro de óleo';
  if (names.length === 1) return `Manutenção de ${names[0].toLocaleLowerCase('pt-BR')}`;
  return names.length > 1 ? 'Manutenção de componentes' : '';
};

const addMonths = (date: string, months: number | undefined) => {
  if (!months) return undefined;
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCMonth(parsed.getUTCMonth() + months);
  return parsed.toISOString().slice(0, 10);
};

export const MaintenanceRecordPage = () => {
  const router = useIonRouter();
  const location = useLocation();
  const {
    selectedVehicle,
    vehicleSystems,
    vehicleComponents,
    updateVehicleMileage,
    refreshVehicleData,
  } = useVehicle();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedComponent = query.get('component');
  const requestedSystem = query.get('system');
  const initialized = useRef(false);
  const [systemId, setSystemId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [service, setService] = useState('');
  const [serviceEdited, setServiceEdited] = useState(false);
  const [date, setDate] = useState(getTodayDate);
  const [mileage, setMileage] = useState(() => selectedVehicle ? formatMileage(selectedVehicle.currentMileage) : '');
  const [viscosity, setViscosity] = useState('');
  const [productType, setProductType] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [workshop, setWorkshop] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialized.current || vehicleSystems.length === 0) return;
    const requestedVehicleComponent = vehicleComponents.find(({ id }) => id === requestedComponent);
    const requestedVehicleSystem = vehicleSystems.find(({ id, catalogId }) =>
      id === requestedSystem || catalogId === requestedSystem,
    );
    const initialSystemId = requestedVehicleComponent?.systemCatalogId
      ?? requestedVehicleSystem?.catalogId
      ?? vehicleSystems.find(({ id }) => id === 'motor')?.catalogId
      ?? vehicleSystems[0].catalogId;
    setSystemId(initialSystemId);
    if (requestedVehicleComponent) {
      setSelected([requestedVehicleComponent.id]);
      setService(buildSuggestion([requestedVehicleComponent.name]));
    }
    initialized.current = true;
  }, [requestedComponent, requestedSystem, vehicleComponents, vehicleSystems]);

  useEffect(() => {
    if (mileage || !selectedVehicle) return;
    setMileage(formatMileage(selectedVehicle.currentMileage));
  }, [mileage, selectedVehicle]);

  const availableComponents = useMemo(
    () => vehicleComponents.filter((component) => component.systemCatalogId === systemId),
    [systemId, vehicleComponents],
  );
  const selectedComponents = useMemo(
    () => vehicleComponents.filter((component) => selected.includes(component.id)),
    [selected, vehicleComponents],
  );
  const oilComponent = selectedComponents.find(({ catalogSlug }) => catalogSlug === 'oleo-do-motor');
  const hasOilFilter = selectedComponents.some(({ catalogSlug }) => catalogSlug === 'filtro-de-oleo');
  const intervalKm = selectedComponents.find(({ maintenance }) => maintenance?.intervalKm)?.maintenance?.intervalKm;
  const intervalMonths = selectedComponents.find(({ maintenance }) => maintenance?.intervalMonths)?.maintenance?.intervalMonths;
  const numericMileage = parseMileage(mileage);
  const nextMileage = numericMileage !== undefined && intervalKm ? numericMileage + intervalKm : undefined;
  const nextDate = addMonths(date, intervalMonths);

  const toggleComponent = (componentId: string) => {
    const next = selected.includes(componentId)
      ? selected.filter((id) => id !== componentId)
      : [...selected, componentId];
    setSelected(next);
    if (!serviceEdited) {
      const names = vehicleComponents.filter((component) => next.includes(component.id)).map(({ name }) => name);
      setService(buildSuggestion(names));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    const parsedMileage = parseMileage(mileage);
    if (!selectedVehicle || !systemId || selected.length === 0 || !date || parsedMileage === undefined || !service.trim()) {
      setError('Preencha sistema, componente, serviço, data e quilometragem.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await createMaintenance({
        vehicleId: selectedVehicle.id,
        serviceDate: date,
        mileage: parsedMileage,
        title: service.trim(),
        items: selectedComponents.map((component) => ({
          vehicleComponentId: component.id,
          description: component.name,
          ...(component.id === oilComponent?.id ? {
            productName: product.trim() || undefined,
            specification: {
              ...(viscosity.trim() ? { viscosity: viscosity.trim() } : {}),
              ...(productType.trim() ? { type: productType.trim() } : {}),
              ...(parseDecimal(quantity) !== undefined ? { volumeLiters: parseDecimal(quantity) as number } : {}),
            },
            quantity: parseDecimal(quantity),
          } : {}),
        })),
        totalCost: parseDecimal(totalCost),
        workshop: workshop.trim() || undefined,
        notes: notes.trim() || undefined,
        intervalKm,
        intervalMonths,
      });
      updateVehicleMileage(selectedVehicle.id, parsedMileage);
      void refreshVehicleData();
      setSaved(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível registrar a manutenção.');
    } finally {
      setSubmitting(false);
    }
  };

  const intervalLabel = [
    intervalKm ? `${formatMileage(intervalKm)} km` : '',
    intervalMonths ? `${intervalMonths} meses` : '',
  ].filter(Boolean).join(' ou ') || 'Sem intervalo definido';
  const nextLabel = [
    nextMileage !== undefined ? `${formatMileage(nextMileage)} km` : '',
    nextDate ? formatMonthYear(nextDate) : '',
  ].filter(Boolean).join(' ou ') || 'Sem previsão';

  return (
    <RecordFormShell title="Registrar manutenção">
      {saved ? (
        <SuccessFeedback
          type="maintenance"
          title="Manutenção registrada!"
          description={<><strong>{service}</strong><span>{formatMileage(numericMileage ?? selectedVehicle?.currentMileage ?? 0)} km · {formatDate(date)}</span></>}
          details={<><span>PRÓXIMA TROCA PREVISTA</span><strong>{nextLabel}</strong></>}
          onContinue={() => router.push('/vehicle', 'back')}
        />
      ) : (
        <form className="cb-record-form" onSubmit={handleSubmit} noValidate>
          <div className="cb-record-intro">
            <span>MANUTENÇÃO</span>
            <h1>O que foi feito no carro?</h1>
            <p>Registre o serviço para manter componentes e previsões em dia.</p>
          </div>

          <RecordFormSection title="Serviço realizado">
            <SelectField label="Sistema" name="system" value={systemId} onChange={(event) => {
              setSystemId(event.target.value);
              setSelected([]);
              if (!serviceEdited) setService('');
            }} options={vehicleSystems.map(({ catalogId, name }) => ({ label: name, value: catalogId }))} />
            <fieldset className="cb-component-selector">
              <legend>Componentes</legend>
              {availableComponents.map((component) => (
                <label key={component.id}>
                  <input type="checkbox" checked={selected.includes(component.id)} onChange={() => toggleComponent(component.id)} />
                  <span>{component.name}</span>
                </label>
              ))}
              {availableComponents.length === 0 && <p className="cb-neutral-note">Nenhum componente disponível neste sistema.</p>}
            </fieldset>
            <FormField label="Serviço" name="service" value={service} onChange={(event) => { setService(event.target.value); setServiceEdited(true); }} />
            <div className="cb-form-grid">
              <DateField label="Data" name="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <MileageField name="mileage" value={mileage} onChange={(event) => setMileage(event.target.value)} />
            </div>
          </RecordFormSection>

          {oilComponent && (
            <RecordFormSection title="Peças e produtos" description="Óleo do motor">
              <div className="cb-form-grid">
                <FormField label="Viscosidade" name="viscosity" value={viscosity} onChange={(event) => setViscosity(event.target.value)} />
                <FormField label="Tipo" name="productType" value={productType} onChange={(event) => setProductType(event.target.value)} />
              </div>
              <FormField label="Marca / Produto" name="product" value={product} onChange={(event) => setProduct(event.target.value)} />
              <FormField label="Quantidade" name="quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} endAdornment="L" inputMode="decimal" />
              {hasOilFilter && <button className="cb-inline-action" type="button"><Plus size={17} /> Adicionar detalhes do filtro</button>}
            </RecordFormSection>
          )}

          <RecordFormSection title="Custo e local">
            <div className="cb-form-grid">
              <CurrencyField label="Valor total" name="totalCost" value={totalCost} onChange={(event) => setTotalCost(event.target.value)} />
              <FormField label="Oficina / Local" name="workshop" value={workshop} onChange={(event) => setWorkshop(event.target.value)} />
            </div>
            <TextareaField label="Observações" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
            <AttachmentButton label="Adicionar foto ou comprovante" />
          </RecordFormSection>

          <RecordFormSection title="Próxima manutenção" action={<button className="cb-text-action" type="button">Editar intervalo</button>}>
            <div className="cb-maintenance-preview">
              <div><span>Intervalo</span><strong>{intervalLabel}</strong></div>
              <ChevronRight size={18} aria-hidden="true" />
              <div><span>Próxima troca prevista</span><strong>{nextLabel}</strong></div>
            </div>
          </RecordFormSection>

          {error && <p className="cb-form-error" role="alert">{error}</p>}
          <FormActions submitLabel="Salvar manutenção" isSubmitting={isSubmitting} onCancel={() => router.goBack()} />
        </form>
      )}
    </RecordFormShell>
  );
};
