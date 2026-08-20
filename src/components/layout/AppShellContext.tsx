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
import { AddVehicleComponentSheet } from '../../features/vehicles/components/AddVehicleComponentSheet';
import { QuickActionSheet } from '../ui/QuickActionSheet';
import { AppSideMenu } from './AppSideMenu';

interface AppShellContextValue {
  openQuickActions: () => void;
  openSideMenu: () => void;
  openMileageUpdate: () => void;
  openAddComponent: (systemCatalogId?: string) => void;
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
  const [isAddComponentOpen, setAddComponentOpen] = useState(false);
  const [addComponentSystemId, setAddComponentSystemId] = useState<string>();

  const closeSideMenu = useCallback(async () => {
    await menuRef.current?.close();
  }, []);

  const openSideMenu = useCallback(() => {
    if (!user || !selectedVehicle) return;
    setQuickActionOpen(false);
    setMileageOpen(false);
    setAddComponentOpen(false);
    void menuRef.current?.open();
  }, [selectedVehicle, user]);

  const openQuickActions = useCallback(() => {
    if (!user || !selectedVehicle) return;
    pendingQuickAction.current = undefined;
    void closeSideMenu();
    setMileageOpen(false);
    setAddComponentOpen(false);
    setQuickActionOpen(true);
  }, [closeSideMenu, selectedVehicle, user]);

  const openMileageUpdate = useCallback(() => {
    if (!user || !selectedVehicle) return;
    pendingQuickAction.current = undefined;
    void closeSideMenu();
    setQuickActionOpen(false);
    setAddComponentOpen(false);
    setMileageOpen(true);
  }, [closeSideMenu, selectedVehicle, user]);

  const openAddComponent = useCallback((systemCatalogId?: string) => {
    if (!user || !selectedVehicle) return;
    pendingQuickAction.current = undefined;
    void closeSideMenu();
    setQuickActionOpen(false);
    setMileageOpen(false);
    setAddComponentSystemId(systemCatalogId);
    setAddComponentOpen(true);
  }, [closeSideMenu, selectedVehicle, user]);

  const selectQuickAction = useCallback((path?: string) => {
    pendingQuickAction.current = path ? { type: 'route', path } : { type: 'mileage' };
    setQuickActionOpen(false);
  }, []);

  const closeQuickActions = useCallback(() => {
    pendingQuickAction.current = undefined;
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
    setAddComponentOpen(false);
    void menuRef.current?.close(false);
  }, [selectedVehicle, user]);

  const value = useMemo<AppShellContextValue>(() => ({
    openAddComponent,
    openMileageUpdate,
    openQuickActions,
    openSideMenu,
  }), [openAddComponent, openMileageUpdate, openQuickActions, openSideMenu]);

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
        onClose={closeQuickActions}
        onDismiss={finishQuickActionDismiss}
        onSelectAction={selectQuickAction}
      />
      <MileageUpdateSheet isOpen={isMileageOpen} onDismiss={() => setMileageOpen(false)} />
      <AddVehicleComponentSheet
        isOpen={isAddComponentOpen}
        initialSystemCatalogId={addComponentSystemId}
        onDismiss={() => setAddComponentOpen(false)}
      />
    </AppShellContext.Provider>
  );
};

export const useAppShell = (): AppShellContextValue => {
  const context = useContext(AppShellContext);
  if (!context) throw new Error('useAppShell must be used within AppShellProvider');
  return context;
};
