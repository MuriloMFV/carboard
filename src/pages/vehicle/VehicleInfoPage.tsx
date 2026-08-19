import { Gauge, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../../components/ui';
import { MileageUpdateSheet } from '../../features/records/components/MileageUpdateSheet';
import { useRecords } from '../../features/records/RecordsContext';
import { VehicleMainShell } from '../../features/vehicles/components/VehicleMainShell';
import { mockVehicle, mockVehicleMetadata } from '../../features/vehicles/mocks';
import { formatDate, formatMileage } from '../../utils/formatters';

const InfoRow = ({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) => (
  <div className="cb-info-row">
    <span>{label}</span>
    <strong className={muted ? 'is-muted' : ''}>{value}</strong>
  </div>
);

export const VehicleInfoPage = () => {
  const [isMileageOpen, setMileageOpen] = useState(false);
  const { currentMileage } = useRecords();

  return (
    <VehicleMainShell>
    <div className="cb-vehicle-screen cb-info-screen">
      <section className="cb-info-section">
        <header><h2>Dados do veículo</h2><span aria-disabled="true"><Pencil size={15} aria-hidden="true" /> Editar</span></header>
        <Card className="cb-list-card">
          <InfoRow label="Apelido" value={mockVehicle.nickname ?? 'Não informado'} />
          <InfoRow label="Marca" value={mockVehicle.brand} />
          <InfoRow label="Modelo" value={mockVehicle.model} />
          <InfoRow label="Ano" value={String(mockVehicle.year)} />
          <InfoRow label="Motor / Versão" value={mockVehicle.engine ?? 'Não informado'} muted={!mockVehicle.engine} />
          <InfoRow label="Combustível" value={mockVehicleMetadata.fuelType} />
        </Card>
      </section>

      <section className="cb-info-section">
        <header><h2>Quilometragem</h2></header>
        <Card className="cb-mileage-info-card">
          <div>
            <span>Quilometragem atual</span>
            <strong>{formatMileage(currentMileage)} km</strong>
            <small>Última atualização: hoje</small>
          </div>
          <button className="cb-info-action" type="button" onClick={() => setMileageOpen(true)}>
            <Gauge size={17} aria-hidden="true" /> Atualizar KM
          </button>
        </Card>
      </section>

      <section className="cb-info-section">
        <header><h2>Identificação</h2></header>
        <Card className="cb-list-card">
          <InfoRow label="Placa" value={mockVehicleMetadata.plate ?? 'Não informado'} muted={!mockVehicleMetadata.plate} />
          <InfoRow label="RENAVAM" value={mockVehicleMetadata.renavam ?? 'Não informado'} muted={!mockVehicleMetadata.renavam} />
        </Card>
      </section>

      <section className="cb-info-section">
        <header><h2>Documentos</h2></header>
        <Card className="cb-list-card">
          <InfoRow label="Licenciamento" value={mockVehicleMetadata.licensingYear ? String(mockVehicleMetadata.licensingYear) : 'Não informado'} muted={!mockVehicleMetadata.licensingYear} />
          <InfoRow label="Seguro" value={mockVehicleMetadata.insurance ?? 'Não informado'} muted={!mockVehicleMetadata.insurance} />
        </Card>
      </section>

      <p className="cb-vehicle-added-date">Adicionado ao CarBoard em {formatDate(mockVehicleMetadata.addedAt)}</p>
    </div>
      <MileageUpdateSheet isOpen={isMileageOpen} onDismiss={() => setMileageOpen(false)} />
    </VehicleMainShell>
  );
};
