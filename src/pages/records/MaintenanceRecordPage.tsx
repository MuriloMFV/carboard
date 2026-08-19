import { useIonRouter } from '@ionic/react';
import { ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { CurrencyField, DateField, FormField, MileageField, SelectField, TextareaField } from '../../components/forms';
import { formatDate, formatMileage, formatMonthYear } from '../../utils/formatters';
import { AttachmentButton } from '../../features/records/components/AttachmentButton';
import { FormActions } from '../../features/records/components/FormActions';
import { RecordFormSection } from '../../features/records/components/RecordFormSection';
import { RecordFormShell } from '../../features/records/components/RecordFormShell';
import { SuccessFeedback } from '../../features/records/components/SuccessFeedback';
import { createRecordId, useRecords } from '../../features/records/RecordsContext';
import { parseDecimal, parseMileage } from '../../features/records/utils';
import { mockVehicle } from '../../features/vehicles/mocks';

const components = [
  { id: 'engine-oil', label: 'Óleo do motor' },
  { id: 'oil-filter', label: 'Filtro de óleo' },
  { id: 'air-filter', label: 'Filtro de ar' },
];

const buildSuggestion = (selected: string[]) => {
  const oil = selected.includes('engine-oil');
  const oilFilter = selected.includes('oil-filter');
  if (oil && oilFilter) return 'Troca de óleo + filtro';
  if (oil) return 'Troca de óleo';
  if (oilFilter) return 'Troca do filtro de óleo';
  if (selected.includes('air-filter')) return 'Troca do filtro de ar';
  return '';
};

export const MaintenanceRecordPage = () => {
  const router = useIonRouter();
  const location = useLocation();
  const { addMaintenance, currentMileage } = useRecords();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedComponent = query.get('component');
  const initialComponents = requestedComponent && components.some(({ id }) => id === requestedComponent)
    ? [requestedComponent]
    : ['engine-oil', 'oil-filter'];
  const [systemId, setSystemId] = useState(query.get('system') ?? 'motor');
  const [selected, setSelected] = useState(initialComponents);
  const [service, setService] = useState(buildSuggestion(initialComponents));
  const [serviceEdited, setServiceEdited] = useState(false);
  const [date, setDate] = useState('2026-08-12');
  const [mileage, setMileage] = useState(formatMileage(currentMileage));
  const [viscosity, setViscosity] = useState('5W-40');
  const [productType, setProductType] = useState('Sintético');
  const [product, setProduct] = useState('Mobil Super 3000');
  const [quantity, setQuantity] = useState('3,5');
  const [totalCost, setTotalCost] = useState('180');
  const [workshop, setWorkshop] = useState('Oficina do João');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const numericMileage = parseMileage(mileage);
  const nextMileage = numericMileage === undefined ? undefined : numericMileage + 10_000;
  const nextDate = useMemo(() => {
    const parsed = new Date(`${date}T00:00:00Z`);
    parsed.setUTCFullYear(parsed.getUTCFullYear() + 1);
    return parsed.toISOString().slice(0, 10);
  }, [date]);

  const toggleComponent = (componentId: string) => {
    const next = selected.includes(componentId)
      ? selected.filter((id) => id !== componentId)
      : [...selected, componentId];
    setSelected(next);
    if (!serviceEdited) setService(buildSuggestion(next));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedMileage = parseMileage(mileage);
    if (!systemId || selected.length === 0 || !date || parsedMileage === undefined || !service.trim()) {
      setError('Preencha sistema, componente, serviço, data e quilometragem.');
      return;
    }

    setError('');
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    addMaintenance({
      id: createRecordId('maintenance'),
      type: 'maintenance',
      vehicleId: mockVehicle.id,
      date,
      mileage: parsedMileage,
      systemId,
      title: service.trim(),
      componentIds: selected,
      items: selected.includes('engine-oil') ? [{
        componentId: 'engine-oil',
        productName: product.trim() || undefined,
        viscosity: viscosity.trim() || undefined,
        productType: productType.trim() || undefined,
        quantity: parseDecimal(quantity),
      }] : [],
      totalCost: parseDecimal(totalCost),
      workshop: workshop.trim() || undefined,
      notes: notes.trim() || undefined,
      intervalKm: 10_000,
      intervalMonths: 12,
    });
    setSubmitting(false);
    setSaved(true);
  };

  return (
    <RecordFormShell title="Registrar manutenção">
      {saved ? (
        <SuccessFeedback
          type="maintenance"
          title="Manutenção registrada!"
          description={<><strong>{service}</strong><span>{formatMileage(numericMileage ?? currentMileage)} km · {formatDate(date)}</span></>}
          details={<><span>PRÓXIMA TROCA PREVISTA</span><strong>{formatMileage(nextMileage ?? currentMileage)} km ou {formatMonthYear(nextDate)}</strong></>}
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
            <SelectField label="Sistema" name="system" value={systemId} onChange={(event) => setSystemId(event.target.value)} options={[
              { label: 'Motor', value: 'motor' },
              { label: 'Freios', value: 'freios' },
              { label: 'Suspensão', value: 'suspensao' },
              { label: 'Elétrica', value: 'eletrica' },
            ]} />
            <fieldset className="cb-component-selector">
              <legend>Componentes</legend>
              {components.map((component) => (
                <label key={component.id}>
                  <input type="checkbox" checked={selected.includes(component.id)} onChange={() => toggleComponent(component.id)} />
                  <span>{component.label}</span>
                </label>
              ))}
            </fieldset>
            <FormField label="Serviço" name="service" value={service} onChange={(event) => { setService(event.target.value); setServiceEdited(true); }} />
            <div className="cb-form-grid">
              <DateField label="Data" name="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <MileageField name="mileage" value={mileage} onChange={(event) => setMileage(event.target.value)} />
            </div>
          </RecordFormSection>

          {selected.includes('engine-oil') && (
            <RecordFormSection title="Peças e produtos" description="Óleo do motor">
              <div className="cb-form-grid">
                <FormField label="Viscosidade" name="viscosity" value={viscosity} onChange={(event) => setViscosity(event.target.value)} />
                <FormField label="Tipo" name="productType" value={productType} onChange={(event) => setProductType(event.target.value)} />
              </div>
              <FormField label="Marca / Produto" name="product" value={product} onChange={(event) => setProduct(event.target.value)} />
              <FormField label="Quantidade" name="quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} endAdornment="L" inputMode="decimal" />
              {selected.includes('oil-filter') && (
                <button className="cb-inline-action" type="button"><Plus size={17} /> Adicionar detalhes do filtro</button>
              )}
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
              <div><span>Intervalo</span><strong>10.000 km ou 12 meses</strong></div>
              <ChevronRight size={18} aria-hidden="true" />
              <div><span>Próxima troca prevista</span><strong>{formatMileage(nextMileage ?? currentMileage)} km ou {formatMonthYear(nextDate)}</strong></div>
            </div>
          </RecordFormSection>

          {error && <p className="cb-form-error" role="alert">{error}</p>}
          <FormActions submitLabel="Salvar manutenção" isSubmitting={isSubmitting} onCancel={() => router.goBack()} />
        </form>
      )}
    </RecordFormShell>
  );
};
