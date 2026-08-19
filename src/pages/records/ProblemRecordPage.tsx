import { useIonRouter } from '@ionic/react';
import { useState, type FormEvent } from 'react';
import { CurrencyField, DateField, FormField, MileageField, SelectField, TextareaField } from '../../components/forms';
import { formatMileage } from '../../utils/formatters';
import { AttachmentButton } from '../../features/records/components/AttachmentButton';
import { FormActions } from '../../features/records/components/FormActions';
import { PriorityControl } from '../../features/records/components/PriorityControl';
import { RecordFormSection } from '../../features/records/components/RecordFormSection';
import { RecordFormShell } from '../../features/records/components/RecordFormShell';
import { SuccessFeedback } from '../../features/records/components/SuccessFeedback';
import { createRecordId, useRecords } from '../../features/records/RecordsContext';
import type { RecordPriority } from '../../features/records/types';
import { parseDecimal, parseMileage } from '../../features/records/utils';
import { mockVehicle } from '../../features/vehicles/mocks';

const priorityLabels: Record<RecordPriority, string> = { low: 'baixa', medium: 'média', high: 'alta' };

export const ProblemRecordPage = () => {
  const router = useIonRouter();
  const { addProblem, currentMileage } = useRecords();
  const [title, setTitle] = useState('Limpador traseiro não funciona');
  const [systemId, setSystemId] = useState('electrical');
  const [componentName, setComponentName] = useState('Limpador traseiro');
  const [date, setDate] = useState('2026-08-12');
  const [mileage, setMileage] = useState(formatMileage(currentMileage));
  const [priority, setPriority] = useState<RecordPriority>('medium');
  const [description, setDescription] = useState('O motor não faz nenhum barulho quando aciono pelo comando.');
  const [estimatedCost, setEstimatedCost] = useState('150');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedMileage = parseMileage(mileage);
    if (!title.trim() || !date || parsedMileage === undefined) {
      setError('Preencha o que está acontecendo, a data e a quilometragem.');
      return;
    }

    setError('');
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    addProblem({
      id: createRecordId('problem'),
      type: 'problem',
      vehicleId: mockVehicle.id,
      title: title.trim(),
      systemId: systemId === 'unknown' ? undefined : systemId,
      componentName: componentName.trim() || undefined,
      date,
      mileage: parsedMileage,
      priority,
      status: 'open',
      description: description.trim() || undefined,
      estimatedCost: parseDecimal(estimatedCost),
    });
    setSubmitting(false);
    setSaved(true);
  };

  const systemLabel = systemId === 'electrical' ? 'Elétrica' : systemId === 'unknown' ? 'Sistema não informado' : 'Outro sistema';

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
            <SelectField label="Sistema relacionado" name="system" value={systemId} onChange={(event) => setSystemId(event.target.value)} options={[
              { label: 'Elétrica', value: 'electrical' },
              { label: 'Motor', value: 'engine' },
              { label: 'Freios', value: 'brakes' },
              { label: 'Suspensão', value: 'suspension' },
              { label: 'Não sei', value: 'unknown' },
            ]} />
            <FormField label="Componente" name="component" value={componentName} onChange={(event) => setComponentName(event.target.value)} />
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
