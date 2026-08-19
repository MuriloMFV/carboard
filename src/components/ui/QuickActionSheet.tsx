import { IonContent, IonModal } from '@ionic/react';
import { Fuel, Gauge, Lightbulb, TriangleAlert, Wrench } from 'lucide-react';
import type { QuickAction } from '../../types/navigation';
import './ui.css';

interface QuickActionSheetProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSelectAction: (path?: string) => void;
}

const actions: QuickAction[] = [
  { label: 'Abastecimento', path: '/register/fuel', icon: Fuel },
  { label: 'Manutenção', path: '/register/maintenance', icon: Wrench },
  { label: 'Problema', path: '/register/problem', icon: TriangleAlert },
  { label: 'Melhoria', path: '/register/improvement', icon: Lightbulb },
  { label: 'Atualizar quilometragem', icon: Gauge },
];

export const QuickActionSheet = ({ isOpen, onDismiss, onSelectAction }: QuickActionSheetProps) => (
  <IonModal
    className="cb-quick-sheet"
    isOpen={isOpen}
    onDidDismiss={onDismiss}
    initialBreakpoint={1}
    breakpoints={[0, 1]}
    backdropDismiss
    keyboardClose
  >
    <IonContent>
      <section className="cb-sheet-content" aria-labelledby="quick-actions-title">
        <div className="cb-sheet-handle" aria-hidden="true" />
        <h2 id="quick-actions-title">Adicionar registro</h2>
        <div className="cb-action-grid">
          {actions.map(({ label, path, icon: Icon }) => (
            <button className="cb-action-item" type="button" key={label} onClick={() => onSelectAction(path)}>
              <Icon size={20} color="var(--cb-primary)" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
    </IonContent>
  </IonModal>
);
