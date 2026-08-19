import { useIonRouter } from '@ionic/react';
import { useEffect, useState, type FormEvent } from 'react';
import { DateField, FormField, MileageField, TextareaField } from '../../components/forms';
import { SegmentedControl } from '../../components/ui';
import { AttachmentButton } from '../../features/records/components/AttachmentButton';
import { FormActions } from '../../features/records/components/FormActions';
import { RecordFormSection } from '../../features/records/components/RecordFormSection';
import { RecordFormShell } from '../../features/records/components/RecordFormShell';
import { SuccessFeedback } from '../../features/records/components/SuccessFeedback';
import { calculateFuelEconomy, calculateFuelValues } from '../../features/records/domain/calculateFuelValues';
import { createFuelRecord, getPreviousFullTankMileage } from '../../features/records/services/fuel.service';
import type { FuelType } from '../../features/records/types';
import { formatDecimalInput, getTodayDate, parseDecimal, parseMileage } from '../../features/records/utils';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { formatCurrency, formatMileage } from '../../utils/formatters';

export const FuelRecordPage = () => {
  const router = useIonRouter();
  const { selectedVehicle, updateVehicleMileage } = useVehicle();
  const [date, setDate] = useState(getTodayDate);
  const [mileage, setMileage] = useState(() => selectedVehicle ? formatMileage(selectedVehicle.currentMileage) : '');
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [totalCost, setTotalCost] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [station, setStation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedEconomy, setSavedEconomy] = useState<{ distance: number; kmPerLiter: number }>();

  useEffect(() => {
    if (mileage || !selectedVehicle) return;
    setMileage(formatMileage(selectedVehicle.currentMileage));
  }, [mileage, selectedVehicle]);

  const fillCalculatedValue = () => {
    const values = calculateFuelValues({
      totalCost: parseDecimal(totalCost),
      liters: parseDecimal(liters),
      pricePerLiter: parseDecimal(pricePerLiter),
    });
    setTotalCost(formatDecimalInput(values.totalCost));
    setLiters(formatDecimalInput(values.liters, 1));
    setPricePerLiter(formatDecimalInput(values.pricePerLiter, 2));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    const parsedMileage = parseMileage(mileage);
    const values = calculateFuelValues({
      totalCost: parseDecimal(totalCost),
      liters: parseDecimal(liters),
      pricePerLiter: parseDecimal(pricePerLiter),
    });
    const availableValues = [values.totalCost, values.liters, values.pricePerLiter]
      .filter((value) => value !== undefined && value > 0).length;
    if (!selectedVehicle || !date || parsedMileage === undefined || availableValues < 2) {
      setError('Preencha data, quilometragem e pelo menos dois valores do abastecimento.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      let previousFullTankMileage: number | undefined;
      try {
        previousFullTankMileage = await getPreviousFullTankMileage(selectedVehicle.id, parsedMileage);
      } catch {
        previousFullTankMileage = undefined;
      }
      await createFuelRecord({
        vehicleId: selectedVehicle.id,
        fueledAt: date,
        mileage: parsedMileage,
        fuelType,
        totalCost: values.totalCost,
        liters: values.liters,
        pricePerLiter: values.pricePerLiter,
        fullTank,
        station: station.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      updateVehicleMileage(selectedVehicle.id, parsedMileage);
      setSavedEconomy(calculateFuelEconomy(previousFullTankMileage, parsedMileage, values.liters, fullTank));
      setTotalCost(formatDecimalInput(values.totalCost));
      setLiters(formatDecimalInput(values.liters, 1));
      setPricePerLiter(formatDecimalInput(values.pricePerLiter, 2));
      setSaved(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar o abastecimento.');
    } finally {
      setSubmitting(false);
    }
  };

  const savedLiters = parseDecimal(liters);
  const savedCost = parseDecimal(totalCost);

  return (
    <RecordFormShell title="Registrar abastecimento">
      {saved ? (
        <SuccessFeedback
          type="fuel"
          title="Abastecimento registrado!"
          description={<><strong>{formatDecimalInput(savedLiters, 1)} L de {fuelType === 'gasoline' ? 'gasolina' : 'etanol'}</strong><span>{savedCost === undefined ? 'Sem valor' : formatCurrency(savedCost)} · {formatMileage(parseMileage(mileage) ?? selectedVehicle?.currentMileage ?? 0)} km</span></>}
          details={savedEconomy && <><span>CONSUMO DESTE PERÍODO</span><strong>{formatDecimalInput(savedEconomy.kmPerLiter, 1)} km/L</strong><small>{formatMileage(savedEconomy.distance)} km desde o último abastecimento</small></>}
          onContinue={() => router.push('/home', 'back')}
        />
      ) : (
        <form className="cb-record-form" onSubmit={handleSubmit} noValidate>
          <div className="cb-record-intro">
            <span>ABASTECIMENTO</span>
            <h1>Dados do abastecimento</h1>
            <p>Informe dois valores e o CarBoard calcula o terceiro para você.</p>
          </div>

          <RecordFormSection>
            <div className="cb-form-grid">
              <DateField label="Data" name="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <MileageField name="mileage" value={mileage} onChange={(event) => setMileage(event.target.value)} />
            </div>
            <div className="cb-labeled-control">
              <span>Combustível</span>
              <SegmentedControl label="Combustível" value={fuelType} onChange={(value) => setFuelType(value as FuelType)} options={[
                { label: 'Gasolina', value: 'gasoline' },
                { label: 'Etanol', value: 'ethanol' },
              ]} />
            </div>
            <div className="cb-fuel-values">
              <FormField label="Valor total" name="totalCost" value={totalCost} onChange={(event) => setTotalCost(event.target.value)} onBlur={fillCalculatedValue} inputMode="decimal" endAdornment="R$" />
              <FormField label="Litros" name="liters" value={liters} onChange={(event) => setLiters(event.target.value)} onBlur={fillCalculatedValue} inputMode="decimal" endAdornment="L" />
              <FormField label="Preço por litro" name="pricePerLiter" value={pricePerLiter} onChange={(event) => setPricePerLiter(event.target.value)} onBlur={fillCalculatedValue} inputMode="decimal" endAdornment="R$/L" />
            </div>
            <label className="cb-toggle-row">
              <span><strong>Tanque cheio</strong><small>Necessário para calcular um ciclo de consumo confiável.</small></span>
              <input type="checkbox" role="switch" checked={fullTank} onChange={(event) => setFullTank(event.target.checked)} />
            </label>
            {!fullTank && <p className="cb-neutral-note">Tanque parcial: o registro será salvo sem calcular consumo.</p>}
          </RecordFormSection>

          <RecordFormSection title="Detalhes">
            <FormField label="Posto" name="station" value={station} onChange={(event) => setStation(event.target.value)} />
            <TextareaField label="Observações" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
            <AttachmentButton label="Adicionar foto ou comprovante" />
          </RecordFormSection>

          {error && <p className="cb-form-error" role="alert">{error}</p>}
          <FormActions submitLabel="Salvar abastecimento" isSubmitting={isSubmitting} onCancel={() => router.goBack()} />
        </form>
      )}
    </RecordFormShell>
  );
};
