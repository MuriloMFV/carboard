import { ChevronUp, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, FilterChip } from '../../components/ui';
import { ComponentRow } from '../../features/vehicles/components/ComponentRow';
import { VehicleMainShell } from '../../features/vehicles/components/VehicleMainShell';
import { mockVehicleComponents, mockVehicleSystems } from '../../features/vehicles/mocks';
import { componentStatusFilters } from '../../features/vehicles/status';
import type { ComponentStatus } from '../../types';

type StatusFilter = ComponentStatus | 'all';

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export const VehicleComponentsPage = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filteredComponents = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return mockVehicleComponents.filter((component) => {
      const matchesQuery = !normalizedQuery || normalize(component.name).includes(normalizedQuery);
      const matchesStatus = status === 'all' || component.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const groups = mockVehicleSystems
    .map((system) => ({
      system,
      components: filteredComponents.filter((component) => component.systemId === system.id),
    }))
    .filter((group) => group.components.length > 0);

  const attentionCount = mockVehicleComponents.filter((component) => component.status === 'attention').length;

  return (
    <VehicleMainShell>
      <div className="cb-vehicle-screen cb-components-screen">
        <section className="cb-screen-heading">
          <h1>Componentes</h1>
          <p>Acompanhe as principais peças e itens do seu carro.</p>
        </section>

        <label className="cb-component-search">
          <span className="cb-sr-only">Buscar componente</span>
          <Search size={19} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar componente" />
        </label>

        <div className="cb-filter-row" aria-label="Filtrar componentes por status">
          {componentStatusFilters.map((filter) => (
            <FilterChip key={filter.value} selected={status === filter.value} onClick={() => setStatus(filter.value)}>
              {filter.label}
            </FilterChip>
          ))}
        </div>

        <p className="cb-attention-count">{attentionCount} itens precisam de atenção</p>

        {groups.length > 0 ? groups.map(({ system, components }) => (
          <section className="cb-component-group" key={system.id}>
            <header>{system.name} ({components.length}) <ChevronUp size={15} aria-hidden="true" /></header>
            <Card className="cb-list-card">
              {components.map((component) => <ComponentRow key={component.id} component={component} compact />)}
            </Card>
          </section>
        )) : (
          <Card className="cb-empty-filter-result">Nenhum componente encontrado.</Card>
        )}

        <button className="cb-add-component-outline" type="button" aria-disabled="true">
          <Plus size={21} aria-hidden="true" /> Adicionar componente
        </button>
      </div>
    </VehicleMainShell>
  );
};
