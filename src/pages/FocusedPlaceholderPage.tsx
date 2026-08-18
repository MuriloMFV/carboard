import { IonContent, IonPage } from '@ionic/react';
import { FocusedHeader } from '../components/layout/FocusedHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui';

interface FocusedPlaceholderPageProps {
  title: string;
  description?: string;
  fallbackPath?: string;
}

export const FocusedPlaceholderPage = ({
  title,
  description = 'Esta tela será implementada em uma próxima etapa.',
  fallbackPath,
}: FocusedPlaceholderPageProps) => (
  <IonPage>
    <FocusedHeader title={title} fallbackPath={fallbackPath} />
    <IonContent className="cb-content">
      <PageContainer>
        <Card>
          <h1>{title}</h1>
          <p className="cb-placeholder-copy">{description}</p>
        </Card>
      </PageContainer>
    </IonContent>
  </IonPage>
);
