import { useIonRouter } from '@ionic/react';
import { Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Card, PrimaryButton } from '../../components/ui';
import { ComponentRow } from '../../features/vehicles/components/ComponentRow';
import { MaintenanceHistoryRow } from '../../features/vehicles/components/MaintenanceHistoryRow';
import { VehicleDetailShell } from '../../features/vehicles/components/VehicleDetailShell';
import { VehicleIcon } from '../../features/vehicles/components/VehicleIcon';
import { mockMotorActivity, mockVehicleComponents, mockVehicleSystems } from '../../features/vehicles/mocks';

interface SystemRouteParams {
  systemId: string;
}

export const VehicleSystemPage = () => {
  const router = useIonRouter();
  const { systemId } = useParams<SystemRouteParams>();
  const system = mockVehicleSystems.find((item) => item.id === systemId);

  if (!system) {
    return (
      <VehicleDetailShell title="Sistema" fallbackPath="/vehicle">
        <Card className="cb-not-found-card"><h1>Sistema não encontrado</h1><p>Volte para Meu Carro e escolha um sistema disponível.</p></Card>
      </VehicleDetailShell>
    );
  }

  const components = mockVehicleComponents.filter((component) => component.systemId === system.id);
  const activity = system.id === 'motor' ? mockMotorActivity : [];

  return (
    <VehicleDetailShell title={system.name} fallbackPath="/vehicle">
      <div className="cb-vehicle-screen cb-system-detail-screen">
        <Card className="cb-system-summary-card">
          <span className="cb-round-icon"><VehicleIcon name={system.icon} size={24} /></span>
          <div>
            <span className="cb-section-eyebrow">{system.name}</span>
            <strong>{system.componentCount} componentes</strong>
            <p>
              <span>{system.goodCount} OK</span>
              {system.attentionCount > 0 && <><i aria-hidden="true" /><em>{system.attentionCount} em atenção</em></>}
              {system.noDataCount > 0 && <><i aria-hidden="true" /><small>{system.noDataCount} sem dados</small></>}
            </p>
          </div>
        </Card>

        <section className="cb-detail-section">
          <h2>Componentes do {system.name.toLocaleLowerCase('pt-BR')}</h2>
          {components.length > 0 ? (
            <Card className="cb-list-card">
              {components.map((component) => <ComponentRow key={component.id} component={component} />)}
            </Card>
          ) : (
            <Card className="cb-empty-filter-result">Nenhum componente cadastrado neste mock.</Card>
          )}
        </section>

        <PrimaryButton
          className="cb-vehicle-primary-action"
          onClick={() => router.push(`/register/maintenance?system=${system.id}`, 'forward')}
        >
          <Plus size={20} aria-hidden="true" /> Registrar manutenção
        </PrimaryButton>

        {activity.length > 0 && (
          <section className="cb-detail-section">
            <h2>Atividade recente</h2>
            <Card className="cb-activity-card">
              {activity.map((record) => <MaintenanceHistoryRow key={record.id} record={record} />)}
              <span className="cb-card-action" aria-disabled="true">Ver histórico do motor ›</span>
            </Card>
          </section>
        )}

        <button className="cb-add-component-text" type="button" aria-disabled="true">
          <Plus size={16} aria-hidden="true" /> Adicionar componente ao {system.name.toLocaleLowerCase('pt-BR')}
        </button>
      </div>
    </VehicleDetailShell>
  );
};
