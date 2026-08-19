import { useIonRouter } from '@ionic/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { MileageUpdateSheet } from '../../features/records/components/MileageUpdateSheet';
import { useVehicle } from '../../features/vehicles/VehicleContext';
import { QuickActionSheet } from '../ui/QuickActionSheet';
import { AppSideMenu } from './AppSideMenu';

interface AppShellContextValue {
  openQuickActions: () => void;
  openSideMenu: () => void;
}

type PendingQuickAction =
  | { type: 'route'; path: string }
  | { type: 'mileage' };

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

export const AppShellProvider = ({ children }: PropsWithChildren) => {
  const router = useIonRouter();
  const { user, signOut } = useAuth();
  const { selectedVehicle } = useVehicle();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const pendingQuickAction = useRef<PendingQuickAction>();
  const [isQuickActionOpen, setQuickActionOpen] = useState(false);
  const [isMileageOpen, setMileageOpen] = useState(false);

  const closeSideMenu = useCallback(async () => {
    await menuRef.current?.close();
  }, []);

  const openSideMenu = useCallback(() => {
    if (!user || !selectedVehicle) return;
    setQuickActionOpen(false);
    setMileageOpen(false);
    void menuRef.current?.open();
  }, [selectedVehicle, user]);

  const openQuickActions = useCallback(() => {
    if (!user || !selectedVehicle) return;
    pendingQuickAction.current = undefined;
    void closeSideMenu();
    setMileageOpen(false);
    setQuickActionOpen(true);
  }, [closeSideMenu, selectedVehicle, user]);

  const selectQuickAction = useCallback((path?: string) => {
    pendingQuickAction.current = path ? { type: 'route', path } : { type: 'mileage' };
    setQuickActionOpen(false);
  }, []);

  const finishQuickActionDismiss = useCallback(() => {
    setQuickActionOpen(false);
    const pending = pendingQuickAction.current;
    pendingQuickAction.current = undefined;
    if (!pending) return;
    if (pending.type === 'mileage') {
      setMileageOpen(true);
      return;
    }
    router.push(pending.path, 'forward');
  }, [router]);

  const navigateFromMenu = useCallback(async (path: string) => {
    await closeSideMenu();
    router.push(path, 'root');
  }, [closeSideMenu, router]);

  const signOutFromMenu = useCallback(async () => {
    await signOut();
    await closeSideMenu();
  }, [closeSideMenu, signOut]);

  useEffect(() => {
    if (user && selectedVehicle) return;
    pendingQuickAction.current = undefined;
    setQuickActionOpen(false);
    setMileageOpen(false);
    void menuRef.current?.close(false);
  }, [selectedVehicle, user]);

  const value = useMemo<AppShellContextValue>(() => ({
    openQuickActions,
    openSideMenu,
  }), [openQuickActions, openSideMenu]);

  return (
    <AppShellContext.Provider value={value}>
      <AppSideMenu
        menuRef={menuRef}
        disabled={!user || !selectedVehicle}
        onNavigate={navigateFromMenu}
        onSignOut={signOutFromMenu}
      />
      {children}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onDismiss={finishQuickActionDismiss}
        onSelectAction={selectQuickAction}
      />
      <MileageUpdateSheet isOpen={isMileageOpen} onDismiss={() => setMileageOpen(false)} />
    </AppShellContext.Provider>
  );
};

export const useAppShell = (): AppShellContextValue => {
  const context = useContext(AppShellContext);
  if (!context) throw new Error('useAppShell must be used within AppShellProvider');
  return context;
};
