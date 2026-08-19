import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import type { ComponentType } from 'react';
import { AppShellProvider } from './components/layout/AppShellContext';
import { APP_CONTENT_ID } from './components/layout/appShell.constants';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { OnboardingProvider } from './features/onboarding/OnboardingContext';
import { VehicleProvider, useVehicle } from './features/vehicles/VehicleContext';
import { FlowLoadingPage } from './pages/FlowLoadingPage';
import { HomePage } from './pages/HomePage';
import { MainPlaceholderPage } from './pages/MainPlaceholderPage';
import { LoginPage, SignUpPage } from './pages/auth/AuthFormPage';
import { InitialCheckPage } from './pages/onboarding/InitialCheckPage';
import { MileagePage } from './pages/onboarding/MileagePage';
import { SetupCompletePage } from './pages/onboarding/SetupCompletePage';
import { VehicleIdentificationPage } from './pages/onboarding/VehicleIdentificationPage';
import { WelcomePage } from './pages/onboarding/WelcomePage';
import { FuelRecordPage } from './pages/records/FuelRecordPage';
import { ImprovementRecordPage } from './pages/records/ImprovementRecordPage';
import { MaintenanceRecordPage } from './pages/records/MaintenanceRecordPage';
import { ProblemRecordPage } from './pages/records/ProblemRecordPage';
import { VehicleComponentPage } from './pages/vehicle/VehicleComponentPage';
import { VehicleComponentsPage } from './pages/vehicle/VehicleComponentsPage';
import { VehicleInfoPage } from './pages/vehicle/VehicleInfoPage';
import { VehicleOverviewPage } from './pages/vehicle/VehicleOverviewPage';
import { VehicleSystemPage } from './pages/vehicle/VehicleSystemPage';

setupIonicReact({ mode: 'md' });

const ExpensesPage = () => (
  <MainPlaceholderPage title="Gastos" description="Os gastos reais do veículo serão consolidados aqui, sem duplicidade." />
);

const HistoryPage = () => (
  <MainPlaceholderPage title="Histórico" description="A linha do tempo unificada dos registros aparecerá aqui." />
);

interface GuardedRouteProps {
  exact?: boolean;
  path: string;
  component: ComponentType;
  requiresVehicle?: boolean;
  onboardingOnly?: boolean;
}

const GuardedRoute = ({ component: Component, requiresVehicle = false, onboardingOnly = false, ...routeProps }: GuardedRouteProps) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedVehicle, isLoading: isVehicleLoading } = useVehicle();

  return (
    <Route
      {...routeProps}
      render={() => {
        if (isAuthLoading || (user && isVehicleLoading)) return <FlowLoadingPage />;
        if (!user) return <Redirect to="/auth/login" />;
        if (onboardingOnly && selectedVehicle) return <Redirect to="/home" />;
        if (requiresVehicle && !selectedVehicle) return <Redirect to="/onboarding" />;
        return <Component />;
      }}
    />
  );
};

const AuthRoute = ({ component: Component, ...routeProps }: Omit<GuardedRouteProps, 'requiresVehicle' | 'onboardingOnly'>) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedVehicle, isLoading: isVehicleLoading } = useVehicle();

  return (
    <Route
      {...routeProps}
      render={() => {
        if (isAuthLoading || (user && isVehicleLoading)) return <FlowLoadingPage />;
        if (user) return <Redirect to={selectedVehicle ? '/home' : '/onboarding'} />;
        return <Component />;
      }}
    />
  );
};

const FlowRedirect = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedVehicle, isLoading: isVehicleLoading } = useVehicle();
  if (isAuthLoading || (user && isVehicleLoading)) return <FlowLoadingPage />;
  if (!user) return <Redirect to="/auth/login" />;
  return <Redirect to={selectedVehicle ? '/home' : '/onboarding'} />;
};

const AppRouter = () => (
  <IonReactRouter>
    <AppShellProvider>
      <IonRouterOutlet id={APP_CONTENT_ID}>
        <AuthRoute exact path="/auth/login" component={LoginPage} />
        <AuthRoute exact path="/auth/signup" component={SignUpPage} />

        <GuardedRoute exact path="/onboarding" component={WelcomePage} onboardingOnly />
        <GuardedRoute exact path="/onboarding/vehicle" component={VehicleIdentificationPage} onboardingOnly />
        <GuardedRoute exact path="/onboarding/mileage" component={MileagePage} onboardingOnly />
        <GuardedRoute exact path="/onboarding/initial-check" component={InitialCheckPage} onboardingOnly />
        <GuardedRoute exact path="/onboarding/complete" component={SetupCompletePage} requiresVehicle />

        <GuardedRoute exact path="/home" component={HomePage} requiresVehicle />
        <GuardedRoute exact path="/vehicle" component={VehicleOverviewPage} requiresVehicle />
        <GuardedRoute exact path="/vehicle/components" component={VehicleComponentsPage} requiresVehicle />
        <GuardedRoute exact path="/vehicle/info" component={VehicleInfoPage} requiresVehicle />
        <GuardedRoute exact path="/vehicle/system/:systemId" component={VehicleSystemPage} requiresVehicle />
        <GuardedRoute exact path="/vehicle/component/:componentId" component={VehicleComponentPage} requiresVehicle />

        <GuardedRoute exact path="/register/maintenance" component={MaintenanceRecordPage} requiresVehicle />
        <GuardedRoute exact path="/register/fuel" component={FuelRecordPage} requiresVehicle />
        <GuardedRoute exact path="/register/problem" component={ProblemRecordPage} requiresVehicle />
        <GuardedRoute exact path="/register/improvement" component={ImprovementRecordPage} requiresVehicle />

        <GuardedRoute exact path="/expenses" component={ExpensesPage} requiresVehicle />
        <GuardedRoute exact path="/history" component={HistoryPage} requiresVehicle />
        <Route exact path="/" component={FlowRedirect} />
        <Route component={FlowRedirect} />
      </IonRouterOutlet>
    </AppShellProvider>
  </IonReactRouter>
);

export default function App() {
  return (
    <IonApp>
      <AuthProvider>
        <VehicleProvider>
          <OnboardingProvider>
            <AppRouter />
          </OnboardingProvider>
        </VehicleProvider>
      </AuthProvider>
    </IonApp>
  );
}
