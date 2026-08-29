import { useState, useCallback } from 'react';

export type AppState = 'discovery' | 'trip_setup' | 'trip_active';
export type VehicleType = 'MOTO' | 'TAXI' | 'MINIBUS' | 'CARGO' | 'ALL';

interface UseAppStateReturn {
  state: AppState;
  selectedService: VehicleType;
  setSelectedService: (service: VehicleType) => void;
  goToTripSetup: () => void;
  goToTripActive: () => void;
  goToDiscovery: () => void;
  resetAll: () => void;
}

export const useAppState = (initialState: AppState = 'discovery'): UseAppStateReturn => {
  const [state, setState] = useState<AppState>(initialState);
  const [selectedService, setSelectedService] = useState<VehicleType>('MOTO');

  const goToTripSetup = useCallback(() => setState('trip_setup'), []);
  const goToTripActive = useCallback(() => setState('trip_active'), []);
  const goToDiscovery = useCallback(() => setState('discovery'), []);
  const resetAll = useCallback(() => {
    setState('discovery');
    setSelectedService('MOTO');
  }, []);

  return { 
    state, 
    selectedService, 
    setSelectedService, 
    goToTripSetup, 
    goToTripActive, 
    goToDiscovery,
    resetAll 
  };
};
