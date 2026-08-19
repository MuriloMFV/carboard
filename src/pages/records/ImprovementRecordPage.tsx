import { useIonRouter } from '@ionic/react';
import { useState, type FormEvent } from 'react';
import { CurrencyField, FormField, SelectField, TextareaField } from '../../components/forms';
import { AttachmentButton } from '../../features/records/components/AttachmentButton';
import { FormActions } from '../../features/records/components/FormActions';
import { PriorityControl } from '../../features/records/components/PriorityControl';
import { RecordFormSection } from '../../features/records/components/RecordFormSection';
import { RecordFormShell } from '../../features/records/components/RecordFormShell';
import { SuccessFeedback } from '../../features/records/components/SuccessFeedback';
import { createRecordId, useRecords } from '../../features/records/RecordsContext';
import type { RecordPriority } from '../../features/records/types';
import { parseDecimal } from '../../features/records/utils';
import { mockVehicle } from '../../features/vehicles/mocks';

const priorityLabels: Record<RecordPriority, string> = { low: 'baixa', medium: 'média', high: 'alta' };

export const ImprovementRecordPage = () => {
  const router = useIonRouter();
  const { addImprovement } = useRecords();
  const [title, setTitle] = useState('Alto-falantes das portas');
  const [category, setCategory] = useState('audio');
  const [priority, setPriority] = useState<RecordPriority>('medium');
  const [estimatedBudget, setEstimatedBudget] = useState('280');
  const [productName, setProductName] = useState('Kit alto-falantes 6"');
  const [productUrl, setProductUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Informe o que você quer melhorar.');
      return;
    }

    setError('');
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    addImprovement({
      id: createRecordId('improvement'),
      type: 'improvement',
      vehicleId: mockVehicle.id,
      title: title.trim(),
      date: new Date().toISOString().slice(0, 10),
      category,
      priority,
      status: 'planned',
      estimatedBudget: parseDecimal(estimatedBudget),
      productName: productName.trim() || undefined,
      productUrl: productUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    setSaved(true);
  };

  return (
    <RecordFormShell title="Registrar melhoria">
      {saved ? (
        <SuccessFeedback
          type="generic"
          title="Melhoria adicionada!"
          description={<><strong>{title}</strong><span>Planejado · Prioridade {priorityLabels[priority]}</span></>}
          details={<><span>STATUS INICIAL</span><strong>Planejado</strong><small>O orçamento não foi lançado como gasto.</small></>}
          onContinue={() => router.push('/vehicle', 'back')}
        />
      ) : (
        <form className="cb-record-form" onSubmit={handleSubmit} noValidate>
          <div className="cb-record-intro">
            <span>MELHORIA</span>
            <h1>O que você quer melhorar?</h1>
            <p>Organize ideias e upgrades antes de comprar ou instalar.</p>
          </div>

          <RecordFormSection>
            <FormField label="O que você quer melhorar?" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <SelectField label="Categoria" name="category" value={category} onChange={(event) => setCategory(event.target.value)} options={[
              { label: 'Som e multimídia', value: 'audio' },
              { label: 'Exterior', value: 'exterior' },
              { label: 'Interior', value: 'interior' },
              { label: 'Iluminação', value: 'lighting' },
              { label: 'Rodas e pneus', value: 'wheels' },
              { label: 'Conforto', value: 'comfort' },
              { label: 'Performance', value: 'performance' },
              { label: 'Segurança', value: 'safety' },
              { label: 'Outro', value: 'other' },
            ]} />
            <PriorityControl value={priority} onChange={setPriority} />
            <CurrencyField label="Orçamento estimado" name="estimatedBudget" value={estimatedBudget} onChange={(event) => setEstimatedBudget(event.target.value)} />
            <p className="cb-neutral-note">Orçamento planejado não é gasto real.</p>
          </RecordFormSection>

          <RecordFormSection title="Produto ou peça">
            <FormField label="Produto / Peça" name="productName" value={productName} onChange={(event) => setProductName(event.target.value)} />
            <FormField label="Link" name="productUrl" type="url" value={productUrl} onChange={(event) => setProductUrl(event.target.value)} placeholder="https://" />
            <AttachmentButton label="Adicionar foto" />
            <TextareaField label="Observações" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </RecordFormSection>

          {error && <p className="cb-form-error" role="alert">{error}</p>}
          <FormActions submitLabel="Salvar melhoria" isSubmitting={isSubmitting} onCancel={() => router.goBack()} />
        </form>
      )}
    </RecordFormShell>
  );
};
