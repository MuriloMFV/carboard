import { IonContent, IonModal } from '@ionic/react';
import { ChevronRight, Fuel, Gauge, Sparkles, TriangleAlert, Wrench, X } from 'lucide-react';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { formatMileage } from '../../utils/formatters';
import './ui.css';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onSelectAction: (path?: string) => void;
}

const actions = [
  { label: 'Abastecimento', description: 'Registrar combustível e consumo', path: '/register/fuel', icon: Fuel, tone: 'fuel' },
  { label: 'Manutenção', description: 'Serviços, trocas e revisões', path: '/register/maintenance', icon: Wrench, tone: 'maintenance' },
  { label: 'Problema', description: 'Algo precisa ser verificado', path: '/register/problem', icon: TriangleAlert, tone: 'problem' },
  { label: 'Melhoria', description: 'Peças, acessórios e upgrades', path: '/register/improvement', icon: Sparkles, tone: 'improvement' },
];

export const QuickActionSheet = ({ isOpen, onClose, onDismiss, onSelectAction }: QuickActionSheetProps) => {
  const { selectedVehicle } = useVehicle();

  return (
    <IonModal
      className="cb-quick-sheet"
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      backdropDismiss
      keyboardClose
      handle={false}
    >
      <IonContent>
        <section className="cb-sheet-content" aria-labelledby="quick-actions-title">
          <div className="cb-sheet-handle" aria-hidden="true" />
          <header className="cb-quick-sheet__header">
            <div>
              <h2 id="quick-actions-title">Adicionar registro</h2>
              <p>O que você quer registrar?</p>
            </div>
            <button type="button" aria-label="Fechar" onClick={onClose}><X size={27} aria-hidden="true" /></button>
          </header>
          <div className="cb-action-list">
            {actions.map(({ label, description, path, icon: Icon, tone }) => (
              <button className="cb-action-item" type="button" key={label} onClick={() => onSelectAction(path)}>
                <span className={`cb-action-item__icon cb-action-item__icon--${tone}`}><Icon size={24} aria-hidden="true" /></span>
                <span className="cb-action-item__copy"><strong>{label}</strong><small>{description}</small></span>
                <ChevronRight className="cb-action-item__chevron" size={24} aria-hidden="true" />
              </button>
            ))}
            <button className="cb-action-item cb-action-item--mileage" type="button" onClick={() => onSelectAction()}>
              <span className="cb-action-item__icon cb-action-item__icon--mileage"><Gauge size={24} aria-hidden="true" /></span>
              <span className="cb-action-item__copy">
                <strong>Atualizar quilometragem</strong>
                <small>{formatMileage(selectedVehicle?.currentMileage ?? 0)} km atualmente</small>
              </span>
              <ChevronRight className="cb-action-item__chevron" size={24} aria-hidden="true" />
            </button>
          </div>
        </section>
      </IonContent>
    </IonModal>
  );
};
