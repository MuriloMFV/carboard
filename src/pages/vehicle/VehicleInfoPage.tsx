import { Gauge, Pencil } from 'lucide-react';
import { Card } from '../../components/ui';
import { VehicleMainShell } from '../../features/vehicles/components/VehicleMainShell';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { formatDate, formatMileage } from '../../utils/formatters';

const InfoRow = ({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) => (
  <div className="cb-info-row">
    <span>{label}</span>
    <strong className={muted ? 'is-muted' : ''}>{value}</strong>
  </div>
);

export const VehicleInfoPage = () => {
  const { selectedVehicle } = useVehicle();
  if (!selectedVehicle) return null;

  const engineAndVersion = [selectedVehicle.engine, selectedVehicle.version]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(' · ');
  const addedAt = selectedVehicle.createdAt ? formatDate(selectedVehicle.createdAt.slice(0, 10)) : null;
  const updatedAt = selectedVehicle.updatedAt ? formatDate(selectedVehicle.updatedAt.slice(0, 10)) : null;

  return (
    <VehicleMainShell>
    <div className="cb-vehicle-screen cb-info-screen">
      <section className="cb-info-section">
        <header><h2>Dados do veículo</h2><span aria-disabled="true"><Pencil size={15} aria-hidden="true" /> Editar</span></header>
        <Card className="cb-list-card">
          <InfoRow label="Apelido" value={selectedVehicle.nickname || 'Não informado'} muted={!selectedVehicle.nickname} />
          <InfoRow label="Marca" value={selectedVehicle.brand} />
          <InfoRow label="Modelo" value={selectedVehicle.model} />
          <InfoRow label="Ano" value={String(selectedVehicle.year)} />
          <InfoRow label="Motor / Versão" value={engineAndVersion || 'Não informado'} muted={!engineAndVersion} />
          <InfoRow label="Combustível" value={selectedVehicle.fuelType || 'Não informado'} muted={!selectedVehicle.fuelType} />
        </Card>
      </section>

      <section className="cb-info-section">
        <header><h2>Quilometragem</h2></header>
        <Card className="cb-mileage-info-card">
          <div>
            <span>Quilometragem atual</span>
            <strong>{formatMileage(selectedVehicle.currentMileage)} km</strong>
            <small>{updatedAt ? `Atualizado em ${updatedAt}` : 'Data de atualização não disponível'}</small>
          </div>
          <button className="cb-info-action" type="button" aria-disabled="true">
            <Gauge size={17} aria-hidden="true" /> Atualizar KM
          </button>
        </Card>
      </section>

      <section className="cb-info-section">
        <header><h2>Identificação</h2></header>
        <Card className="cb-list-card">
          <InfoRow label="Placa" value={selectedVehicle.plate || 'Não informado'} muted={!selectedVehicle.plate} />
        </Card>
      </section>

      {addedAt && <p className="cb-vehicle-added-date">Adicionado ao CarBoard em {addedAt}</p>}
    </div>
    </VehicleMainShell>
  );
};
