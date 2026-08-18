import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'Visão geral', path: '/vehicle' },
  { label: 'Componentes', path: '/vehicle/components' },
  { label: 'Informações', path: '/vehicle/info' },
];

export const VehicleTabs = () => (
  <nav className="cb-vehicle-tabs" aria-label="Seções de Meu Carro">
    {tabs.map((tab) => (
      <NavLink key={tab.path} to={tab.path} exact activeClassName="is-active">
        {tab.label}
      </NavLink>
    ))}
  </nav>
);
