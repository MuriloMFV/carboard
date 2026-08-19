import { PrimaryButton } from '../../../components/ui';

interface FormActionsProps {
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const FormActions = ({ submitLabel, isSubmitting, onCancel }: FormActionsProps) => (
  <div className="cb-record-actions">
    <PrimaryButton className="cb-record-primary" type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Salvando…' : submitLabel}
    </PrimaryButton>
    <button className="cb-record-cancel" type="button" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
  </div>
);
