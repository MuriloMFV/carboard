import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/logotexto.png';
import { LottieAnimation, PrimaryButton } from '../../components/ui';
import carAnimation from '../../../docs/design/onboarding/Mr Bean\'s Mini.json';
import './onboarding.css';

export const WelcomePage = () => {
  const history = useHistory();

  return (
    <IonPage className="cb-onboarding-page cb-welcome-page">
      <IonContent fullscreen className="cb-onboarding-content">
        <main className="cb-welcome-layout">
          <img className="cb-welcome-logo" src={logo} alt="CarBoard" />
          <div className="cb-welcome-car" role="img" aria-label="Animação de um carro azul">
            <LottieAnimation animationData={carAnimation} />
          </div>
          <section className="cb-welcome-copy">
            <h1>Seu carro. Tudo sob controle.</h1>
            <p>Manutenção, peças, consumo, gastos e melhorias em um só lugar.</p>
          </section>
          <div className="cb-welcome-actions">
            <PrimaryButton onClick={() => history.push('/onboarding/vehicle')}>Adicionar meu carro</PrimaryButton>
            <span>Já tenho uma conta</span>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
};
