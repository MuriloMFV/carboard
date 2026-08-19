import { useIonRouter } from '@ionic/react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CurrencyField, DateField, FormField, MileageField, SelectField, TextareaField } from '../../components/forms';
import { AttachmentButton } from '../../features/records/components/AttachmentButton';
import { FormActions } from '../../features/records/components/FormActions';
import { PriorityControl } from '../../features/records/components/PriorityControl';
import { RecordFormSection } from '../../features/records/components/RecordFormSection';
import { RecordFormShell } from '../../features/records/components/RecordFormShell';
import { SuccessFeedback } from '../../features/records/components/SuccessFeedback';
import { createProblem } from '../../features/records/services/problem.service';
import type { RecordPriority } from '../../features/records/types';
import { getTodayDate, parseDecimal, parseMileage } from '../../features/records/utils';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { formatMileage } from '../../utils/formatters';

const priorityLabels: Record<RecordPriority, string> = { low: 'baixa', medium: 'média', high: 'alta' };

export const ProblemRecordPage = () => {
  const router = useIonRouter();
  const { selectedVehicle, vehicleSystems, vehicleComponents, updateVehicleMileage } = useVehicle();
  const [title, setTitle] = useState('');
  const [systemId, setSystemId] = useState('');
  const [componentId, setComponentId] = useState('');
  const [date, setDate] = useState(getTodayDate);
  const [mileage, setMileage] = useState(() => selectedVehicle ? formatMileage(selectedVehicle.currentMileage) : '');
  const [priority, setPriority] = useState<RecordPriority>('medium');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mileage || !selectedVehicle) return;
    setMileage(formatMileage(selectedVehicle.currentMileage));
  }, [mileage, selectedVehicle]);

  const relatedComponents = useMemo(
    () => systemId
      ? vehicleComponents.filter((component) => component.systemCatalogId === systemId)
      : vehicleComponents,
    [systemId, vehicleComponents],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    const parsedMileage = parseMileage(mileage);
    if (!selectedVehicle || !title.trim() || !date || parsedMileage === undefined) {
      setError('Preencha o que está acontecendo, a data e a quilometragem.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await createProblem({
        vehicleId: selectedVehicle.id,
        title: title.trim(),
        systemId: systemId || undefined,
        vehicleComponentId: componentId || undefined,
        detectedAt: date,
        mileage: parsedMileage,
        priority,
        description: description.trim() || undefined,
        estimatedCost: parseDecimal(estimatedCost),
      });
      updateVehicleMileage(selectedVehicle.id, parsedMileage);
      setSaved(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível registrar o problema.');
    } finally {
      setSubmitting(false);
    }
  };

  const systemLabel = vehicleSystems.find(({ catalogId }) => catalogId === systemId)?.name ?? 'Sistema não informado';

  return (
    <RecordFormShell title="Registrar problema">
      {saved ? (
        <SuccessFeedback
          type="generic"
          title="Problema registrado!"
          description={<><strong>{title}</strong><span>{systemLabel} · Prioridade {priorityLabels[priority]}</span></>}
          details={<><span>STATUS INICIAL</span><strong>Em aberto</strong><small>A estimativa não foi lançada como gasto.</small></>}
          onContinue={() => router.push('/vehicle', 'back')}
        />
      ) : (
        <form className="cb-record-form" onSubmit={handleSubmit} noValidate>
          <div className="cb-record-intro">
            <span>PROBLEMA</span>
            <h1>O que precisa ser resolvido?</h1>
            <p>Descreva o que percebeu. Não é necessário saber o diagnóstico.</p>
          </div>

          <RecordFormSection>
            <FormField label="O que está acontecendo?" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <SelectField label="Sistema relacionado" name="system" value={systemId} onChange={(event) => {
              setSystemId(event.target.value);
              setComponentId('');
            }} options={[
              { label: 'Não sei', value: '' },
              ...vehicleSystems.map(({ catalogId, name }) => ({ label: name, value: catalogId })),
            ]} />
            <SelectField label="Componente" name="component" value={componentId} onChange={(event) => setComponentId(event.target.value)} options={[
              { label: 'Não informado', value: '' },
              ...relatedComponents.map(({ id, name }) => ({ label: name, value: id })),
            ]} />
            <div className="cb-form-grid">
              <DateField label="Data" name="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <MileageField name="mileage" value={mileage} onChange={(event) => setMileage(event.target.value)} />
            </div>
            <PriorityControl value={priority} onChange={setPriority} />
          </RecordFormSection>

          <RecordFormSection title="Detalhes">
            <TextareaField label="Descrição" name="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            <AttachmentButton label="Adicionar fotos" />
            <CurrencyField label="Estimativa de custo" name="estimatedCost" value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} />
            <p className="cb-neutral-note">A estimativa ajuda no planejamento e não será contabilizada como gasto real.</p>
          </RecordFormSection>

          {error && <p className="cb-form-error" role="alert">{error}</p>}
          <FormActions submitLabel="Registrar problema" isSubmitting={isSubmitting} onCancel={() => router.goBack()} />
        </form>
      )}
    </RecordFormShell>
  );
};
