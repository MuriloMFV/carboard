import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, QuickActionSheet } from '../components/ui';

interface MainPlaceholderPageProps {
  title: string;
  description: string;
}

export const MainPlaceholderPage = ({ title, description }: MainPlaceholderPageProps) => {
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <IonPage>
      <AppHeader />
      <IonContent className="cb-content">
        <PageContainer>
          <Card>
            <h1>{title}</h1>
            <p className="cb-placeholder-copy">{description}</p>
          </Card>
        </PageContainer>
      </IonContent>
      <BottomNavigation onQuickAction={() => setQuickActionOpen(true)} />
      <QuickActionSheet isOpen={isQuickActionOpen} onDismiss={() => setQuickActionOpen(false)} />
    </IonPage>
  );
};
