import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { OnboardingProvider } from './features/onboarding/OnboardingContext';
import { FocusedPlaceholderPage } from './pages/FocusedPlaceholderPage';
import { HomePage } from './pages/HomePage';
import { MainPlaceholderPage } from './pages/MainPlaceholderPage';
import { InitialCheckPage } from './pages/onboarding/InitialCheckPage';
import { MileagePage } from './pages/onboarding/MileagePage';
import { SetupCompletePage } from './pages/onboarding/SetupCompletePage';
import { VehicleIdentificationPage } from './pages/onboarding/VehicleIdentificationPage';
import { WelcomePage } from './pages/onboarding/WelcomePage';
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

export default function App() {
  return (
    <IonApp>
      <OnboardingProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/onboarding" component={WelcomePage} />
            <Route exact path="/onboarding/vehicle" component={VehicleIdentificationPage} />
            <Route exact path="/onboarding/mileage" component={MileagePage} />
            <Route exact path="/onboarding/initial-check" component={InitialCheckPage} />
            <Route exact path="/onboarding/complete" component={SetupCompletePage} />

            <Route exact path="/home" component={HomePage} />
            <Route exact path="/vehicle" component={VehicleOverviewPage} />
            <Route exact path="/vehicle/components" component={VehicleComponentsPage} />
            <Route exact path="/vehicle/info" component={VehicleInfoPage} />
            <Route exact path="/vehicle/system/:systemId" component={VehicleSystemPage} />
            <Route exact path="/vehicle/component/:componentId" component={VehicleComponentPage} />

            <Route exact path="/register/maintenance" render={() => <FocusedPlaceholderPage title="Registrar manutenção" />} />
            <Route exact path="/register/fuel" render={() => <FocusedPlaceholderPage title="Registrar abastecimento" />} />
            <Route exact path="/register/problem" render={() => <FocusedPlaceholderPage title="Registrar problema" />} />
            <Route exact path="/register/improvement" render={() => <FocusedPlaceholderPage title="Registrar melhoria" />} />

            <Route exact path="/expenses" component={ExpensesPage} />
            <Route exact path="/history" component={HistoryPage} />
            <Route exact path="/" render={() => <Redirect to="/home" />} />
            <Route render={() => <Redirect to="/home" />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </OnboardingProvider>
    </IonApp>
  );
}
