import { IonContent, IonModal } from '@ionic/react';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FormField, SelectField } from '../../../components/forms';
import { PrimaryButton } from '../../../components/ui';
import { useVehicle } from '../VehicleContext';
import { createCustomVehicleComponent } from '../vehicle.service';
import '../vehicle.css';

interface AddVehicleComponentSheetProps {
  isOpen: boolean;
  initialSystemCatalogId?: string;
  onDismiss: () => void;
}

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');

export const AddVehicleComponentSheet = ({
  isOpen,
  initialSystemCatalogId,
  onDismiss,
}: AddVehicleComponentSheetProps) => {
  const {
    selectedVehicle,
    vehicleComponents,
    vehicleSystems,
    refreshVehicleData,
  } = useVehicle();
  const [systemCatalogId, setSystemCatalogId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const systemOptions = useMemo(() => vehicleSystems.map((system) => ({
    label: system.name,
    value: system.catalogId,
  })), [vehicleSystems]);

  useEffect(() => {
    if (!isOpen) return;
    const initialSystemExists = vehicleSystems.some((system) => system.catalogId === initialSystemCatalogId);
    setSystemCatalogId(initialSystemExists ? initialSystemCatalogId ?? '' : vehicleSystems[0]?.catalogId ?? '');
    setName('');
    setError('');
    setSubmitting(false);
  }, [initialSystemCatalogId, isOpen, vehicleSystems]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const customName = name.trim();
    if (!selectedVehicle || !systemCatalogId) {
      setError('Selecione um sistema do veículo.');
      return;
    }
    if (!customName) {
      setError('Informe o nome do componente.');
      return;
    }
    if (vehicleComponents.some((component) => normalize(component.name) === normalize(customName))) {
      setError('Este componente já está cadastrado no veículo.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await createCustomVehicleComponent({
        vehicleId: selectedVehicle.id,
        systemCatalogId,
        name: customName,
      });
      await refreshVehicleData();
      onDismiss();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível adicionar o componente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonModal
      className="cb-add-component-sheet"
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      backdropDismiss
      keyboardClose
      handle={false}
    >
      <IonContent>
        <form className="cb-add-component-sheet__content" onSubmit={handleSubmit} noValidate>
          <div className="cb-sheet-handle" aria-hidden="true" />
          <header className="cb-add-component-sheet__header">
            <div>
              <h2>Adicionar componente</h2>
              <p>Inclua uma peça ou item específico do seu carro.</p>
            </div>
            <button type="button" aria-label="Fechar" onClick={onDismiss}><X size={25} aria-hidden="true" /></button>
          </header>

          <div className="cb-add-component-sheet__fields">
            <SelectField
              label="Sistema"
              name="component-system"
              value={systemCatalogId}
              onChange={(event) => setSystemCatalogId(event.target.value)}
              options={systemOptions}
              disabled={systemOptions.length === 0}
            />
            <FormField
              label="Nome do componente"
              name="component-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Câmera de ré"
              maxLength={80}
              autoComplete="off"
              aria-invalid={Boolean(error)}
            />
          </div>

          {error && <p className="cb-add-component-sheet__error" role="alert">{error}</p>}
          <PrimaryButton type="submit" disabled={isSubmitting || systemOptions.length === 0}>
            {isSubmitting ? 'Adicionando…' : 'Adicionar componente'}
          </PrimaryButton>
        </form>
      </IonContent>
    </IonModal>
  );
};
