import { IonContent, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import {
  BellRing,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Fuel,
  Info,
  Pencil,
  Sparkles,
  TriangleAlert,
  WalletCards,
  Wrench,
} from 'lucide-react';
import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import vehicleReference from '../../docs/features/vehicle/CarBoard Dashboard - Final Polish.png';
import { AppHeader } from '../components/layout/AppHeader';
import { useAppShell } from '../components/layout/AppShellContext';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui';
import { loadDashboardData } from '../features/dashboard/dashboard.service';
import type { DashboardData, FuelEconomyPoint, MonthlyExpenses } from '../features/dashboard/types';
import '../features/dashboard/dashboard.css';
import { buildVehicleHealth } from '../features/vehicles/domain/buildVehicleOverview';
import { useVehicle } from '../features/vehicles/VehicleContext';
import type { VehicleComponent } from '../features/vehicles/types';
import { formatCurrency, formatMileage } from '../utils/formatters';

const formatDecimal = (value: number) => new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format(value);

const formatCompactCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
}).format(value);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const FuelTrendChart = ({ points }: { points: FuelEconomyPoint[] }) => {
  if (points.length === 0) {
    return <div className="cb-dashboard-chart-empty">Complete dois abastecimentos para gerar o gráfico.</div>;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = Math.max(max - min, 1);
  const x = (index: number) => points.length === 1 ? 75 : 4 + (index * 142) / (points.length - 1);
  const y = (value: number) => 55 - ((value - min) / range) * 45;
  const coordinates = points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');

  return (
    <svg className="cb-dashboard-fuel-chart" viewBox="0 0 150 64" role="img" aria-label="Evolução do consumo nos últimos abastecimentos">
      <line x1="4" y1="10" x2="146" y2="10" />
      <line x1="4" y1="32" x2="146" y2="32" />
      <line x1="4" y1="55" x2="146" y2="55" />
      <polyline points={coordinates} />
      {points.map((point, index) => <circle key={`${point.date}-${index}`} cx={x(index)} cy={y(point.value)} r="3.5" />)}
    </svg>
  );
};

const ExpenseBreakdown = ({ expenses }: { expenses: MonthlyExpenses }) => {
  const width = (value: number) => expenses.total > 0 ? `${(value / expenses.total) * 100}%` : '0%';
  const items = [
    ['Combustível', expenses.fuel],
    ['Manutenção', expenses.maintenance],
    ['Outros', expenses.other],
  ] as const;

  return (
    <>
      <div className="cb-dashboard-expense-bar" aria-label="Distribuição dos gastos do mês">
        <span style={{ width: width(expenses.fuel) }} />
        <span style={{ width: width(expenses.maintenance) }} />
        <span style={{ width: width(expenses.other) }} />
      </div>
      <dl className="cb-dashboard-expense-list">
        {items.map(([label, value]) => (
          <div key={label}>
            <span className="cb-dashboard-expense-dot" aria-hidden="true" />
            <dt>{label}</dt>
            <dd>{formatCompactCurrency(value)}</dd>
          </div>
        ))}
      </dl>
    </>
  );
};

const getPrimaryAttention = (components: VehicleComponent[], dashboard?: DashboardData) => {
  const highPriorityProblem = dashboard?.openProblems.find((problem) => problem.priority === 'high');
  if (highPriorityProblem) {
    return { title: highPriorityProblem.title, description: 'Problema de prioridade alta', path: '/vehicle' };
  }

  const criticalComponent = components.find((item) => item.status === 'critical');
  const component = criticalComponent ?? components.find((item) => item.status === 'attention');
  if (component) {
    return {
      title: component.name,
      description: component.summary,
      path: `/vehicle/component/${component.id}`,
    };
  }
  const problem = dashboard?.openProblems[0];
  if (problem) return { title: problem.title, description: 'Problema em aberto', path: '/vehicle' };
  return undefined;
};

export const HomePage = () => {
  const router = useIonRouter();
  const { openMileageUpdate } = useAppShell();
  const {
    selectedVehicle,
    vehicleComponents,
    isVehicleDataLoading,
    refreshVehicleData,
  } = useVehicle();
  const [dashboard, setDashboard] = useState<DashboardData>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    setError('');
    try {
      const [nextDashboard] = await Promise.all([
        loadDashboardData(selectedVehicle.id),
        refreshVehicleData(),
      ]);
      setDashboard(nextDashboard);
    } catch (loadError) {
      console.error('Falha ao carregar o dashboard.', loadError);
      setError('Não foi possível atualizar todos os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, [refreshVehicleData, selectedVehicle]);

  useIonViewWillEnter(() => {
    void load();
  }, [load]);

  const health = useMemo(() => buildVehicleHealth(vehicleComponents), [vehicleComponents]);
  const attention = getPrimaryAttention(vehicleComponents, dashboard);
  const notificationCount = health.attentionCount + (dashboard?.openProblems.length ?? 0);

  if (!selectedVehicle) return null;

  const name = selectedVehicle.nickname || `${selectedVehicle.brand} ${selectedVehicle.model}`;
  const engineDescription = [selectedVehicle.engine, selectedVehicle.version]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(' · ');
  const vehicleDescription = `${selectedVehicle.brand} ${selectedVehicle.model}${engineDescription ? ` ${engineDescription}` : ''} · ${selectedVehicle.year}`;
  const expenses = dashboard?.monthlyExpenses;

  const quickActions = [
    { label: 'Abastecer', icon: Fuel, color: 'var(--cb-primary)', path: '/register/fuel' },
    { label: 'Manutenção', icon: Wrench, color: '#4f5666', path: '/register/maintenance' },
    { label: 'Problema', icon: TriangleAlert, color: '#d71920', path: '/register/problem' },
    { label: 'Melhoria', icon: Sparkles, color: 'var(--cb-upgrade)', path: '/register/improvement' },
    { label: 'Despesa', icon: WalletCards, color: '#25b963', path: '/expenses' },
  ];

  return (
    <IonPage className="cb-dashboard-page">
      <AppHeader notificationCount={notificationCount} />
      <IonContent className="cb-content cb-dashboard-content">
        <PageContainer className="cb-dashboard-container">
          <div className="cb-dashboard-layout">
            <section className="cb-dashboard-hero" aria-labelledby="dashboard-vehicle-name">
              <div className="cb-dashboard-vehicle-copy">
                <button className="cb-dashboard-vehicle-link" type="button" onClick={() => router.push('/vehicle', 'forward')}>
                  <strong id="dashboard-vehicle-name">{name}</strong>
                  <ChevronDown size={17} aria-hidden="true" />
                </button>
                <p>{vehicleDescription}</p>
                <span className="cb-dashboard-mileage-label">Quilometragem atual</span>
                <div className="cb-dashboard-mileage">
                  <strong>{formatMileage(selectedVehicle.currentMileage)}</strong><small>km</small>
                </div>
                <button className="cb-dashboard-mileage-action" type="button" onClick={openMileageUpdate}>
                  <Pencil size={15} aria-hidden="true" /> Atualizar KM
                </button>
              </div>
              <div className="cb-dashboard-car" role="img" aria-label={`Veículo ${selectedVehicle.brand} ${selectedVehicle.model}`}>
                <img src={vehicleReference} alt="" aria-hidden="true" />
              </div>
            </section>

            {error && (
              <div className="cb-dashboard-inline-state" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => void load()}>Tentar novamente</button>
              </div>
            )}

            {(isLoading || isVehicleDataLoading) && !dashboard ? (
              <Card className="cb-dashboard-card cb-dashboard-loading" aria-label="Carregando resumo do dashboard" />
            ) : (
              <Card className="cb-dashboard-card cb-dashboard-health-card">
                <section className="cb-dashboard-health">
                  <p className="cb-dashboard-eyebrow">Saúde do veículo <Info size={13} aria-hidden="true" /></p>
                  <div className="cb-dashboard-health-score">
                    <strong>{health.percentage ?? '—'}{health.percentage !== undefined && <small>%</small>}</strong>
                    <span>{health.label}</span>
                  </div>
                  <div className="cb-dashboard-progress" role="progressbar" aria-label={`Saúde do veículo: ${health.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={health.percentage}>
                    <span style={{ width: `${health.percentage ?? 0}%` }} />
                  </div>
                  <p className="cb-dashboard-health-counts">{health.goodCount} itens OK · <em>{health.attentionCount} em atenção</em></p>
                </section>
                <section className={`cb-dashboard-attention ${attention ? '' : 'cb-dashboard-attention--good'}`}>
                  <p className="cb-dashboard-eyebrow">
                    {attention ? <TriangleAlert size={15} aria-hidden="true" /> : <BellRing size={15} aria-hidden="true" />}
                    {attention ? 'Precisa de atenção' : 'Tudo em ordem'}
                  </p>
                  <h2>{attention?.title ?? 'Nenhuma atenção pendente'}</h2>
                  {attention?.description && <p>{attention.description}</p>}
                  <button className="cb-dashboard-detail-link" type="button" onClick={() => router.push(attention?.path ?? '/vehicle', 'forward')}>
                    Ver detalhes <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </section>
              </Card>
            )}

            <section className="cb-dashboard-metrics" aria-label="Indicadores do veículo">
              <Card className="cb-dashboard-card cb-dashboard-metric-card">
                <p className="cb-dashboard-metric-title"><Fuel size={16} aria-hidden="true" /> Consumo médio</p>
                <div className="cb-dashboard-metric-value">
                  <strong>{dashboard?.averageConsumption !== undefined ? formatDecimal(dashboard.averageConsumption) : '—'}</strong>
                  <span>km/L</span>
                </div>
                <p className="cb-dashboard-metric-subtitle">
                  {dashboard?.fuelEconomy.length ? `Últimos ${dashboard.fuelEconomy.length} abastecimentos` : 'Ainda sem consumo calculado'}
                </p>
                <FuelTrendChart points={dashboard?.fuelEconomy ?? []} />
              </Card>

              <Card className="cb-dashboard-card cb-dashboard-metric-card">
                <p className="cb-dashboard-metric-title"><CircleDollarSign size={16} aria-hidden="true" /> Gastos do mês</p>
                <div className="cb-dashboard-metric-value">
                  <small>R$</small>
                  <strong>{expenses ? formatCompactCurrency(expenses.total).replace('R$', '').trim() : '—'}</strong>
                </div>
                <p className="cb-dashboard-metric-subtitle">{expenses ? capitalize(expenses.monthLabel) : 'Carregando período atual'}</p>
                {expenses && <ExpenseBreakdown expenses={expenses} />}
              </Card>
            </section>

            <Card className="cb-dashboard-card cb-dashboard-improvement">
              <p className="cb-dashboard-eyebrow"><Sparkles size={17} aria-hidden="true" /> Próxima melhoria</p>
              <div className="cb-dashboard-improvement-row">
                <h2>{dashboard?.nextImprovement?.title ?? 'Nenhuma melhoria planejada'}</h2>
                {dashboard?.nextImprovement?.estimatedBudget !== undefined && (
                  <strong>{formatCurrency(dashboard.nextImprovement.estimatedBudget).replace(',00', '')}</strong>
                )}
              </div>
              {dashboard?.nextImprovement && (
                <p>Planejado <i aria-hidden="true" /> Prioridade: {priorityLabels[dashboard.nextImprovement.priority]}</p>
              )}
            </Card>

            <section className="cb-dashboard-quick-section" aria-labelledby="dashboard-quick-actions-title">
              <h2 id="dashboard-quick-actions-title" className="cb-dashboard-section-title">Ações rápidas</h2>
              <div className="cb-dashboard-quick-actions">
                {quickActions.map(({ label, icon: Icon, color, path }) => (
                  <button
                    key={label}
                    className="cb-dashboard-quick-action"
                    style={{ '--action-color': color } as CSSProperties}
                    type="button"
                    onClick={() => router.push(path, 'forward')}
                  >
                    <Icon size={21} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </PageContainer>
      </IonContent>
      <BottomNavigation />
    </IonPage>
  );
};
