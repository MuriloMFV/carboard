import { IonContent, IonModal } from '@ionic/react';
import { useEffect, useState, type FormEvent } from 'react';
import { MileageField } from '../../../components/forms';
import { PrimaryButton } from '../../../components/ui';
import { formatMileage } from '../../../utils/formatters';
import { useVehicle } from '../../vehicles/VehicleContext';
import { updateVehicleMileageIfGreater } from '../services/mileage.service';
import { getTodayDate, parseMileage } from '../utils';
import { SuccessFeedback } from './SuccessFeedback';
import '../records.css';

interface MileageUpdateSheetProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const MileageUpdateSheet = ({ isOpen, onDismiss }: MileageUpdateSheetProps) => {
  const { selectedVehicle, updateVehicleMileage, refreshVehicles } = useVehicle();
  const currentMileage = selectedVehicle?.currentMileage ?? 0;
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [updatedRange, setUpdatedRange] = useState<{ previous: number; next: number }>();

  useEffect(() => {
    if (!isOpen) return;
    setValue(formatMileage(currentMileage));
    setError('');
    setUpdatedRange(undefined);
  }, [currentMileage, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextMileage = parseMileage(value);
    if (nextMileage === undefined || nextMileage <= currentMileage) {
      setError(`Informe uma quilometragem maior que ${formatMileage(currentMileage)} km.`);
      return;
    }

    setError('');
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    if (!selectedVehicle) {
      setError('Nenhum veículo selecionado.');
      setSubmitting(false);
      return;
    }

    try {
      const updated = await updateVehicleMileageIfGreater({
        vehicleId: selectedVehicle.id,
        currentMileage,
        candidateMileage: nextMileage,
        sourceType: 'manual',
        recordedAt: getTodayDate(),
      });
      if (!updated) {
        await refreshVehicles();
        setError('A quilometragem informada precisa ser maior que a atual.');
        return;
      }
      updateVehicleMileage(selectedVehicle.id, nextMileage);
      setUpdatedRange({ previous: currentMileage, next: nextMileage });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível atualizar a quilometragem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonModal
      className="cb-mileage-sheet"
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      backdropDismiss
      keyboardClose
      handle={false}
    >
      <IonContent>
        <div className="cb-mileage-sheet__content">
          <div className="cb-sheet-handle" aria-hidden="true" />
          {updatedRange ? (
            <SuccessFeedback
              type="mileage"
              title="Quilometragem atualizada!"
              description={<strong>{formatMileage(updatedRange.previous)} → {formatMileage(updatedRange.next)} km</strong>}
              onContinue={onDismiss}
            />
          ) : (
            <form className="cb-mileage-form" onSubmit={handleSubmit} noValidate>
              <header>
                <p>QUILOMETRAGEM</p>
                <h2>Atualizar quilometragem</h2>
                <span>O hodômetro só pode avançar automaticamente.</span>
              </header>
              <MileageField
                label="Quilometragem atual"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-invalid={Boolean(error)}
              />
              {error && <p className="cb-form-error" role="alert">{error}</p>}
              <PrimaryButton className="cb-record-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Atualizando…' : 'Atualizar quilometragem'}
              </PrimaryButton>
              <button className="cb-record-cancel" type="button" onClick={onDismiss}>Cancelar</button>
            </form>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
