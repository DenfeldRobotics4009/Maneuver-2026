import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutingSession } from './useScoutingSession';
import { clearScoutingLocalStorage } from '@/core/lib/utils';

interface UseNavigationConfirmOptions {
  /**
   * Function to determine if navigation should be blocked
   * If not provided, will use scouting session detection
   */
  shouldBlock?: () => boolean;
}

export function useNavigationConfirm(options: UseNavigationConfirmOptions = {}) {
  const navigate = useNavigate();
  const { hasUnsavedData } = useScoutingSession();
  const [pendingNavigation, setPendingNavigation] = useState<{
    destination: string;
    label?: string;
  } | null>(null);

  const shouldBlock = useMemo(() => {
    return options.shouldBlock || (() => hasUnsavedData);
  }, [options.shouldBlock, hasUnsavedData]);

  const confirmNavigation = useCallback((destination: string, label?: string) => {
    if (shouldBlock()) {
      setPendingNavigation({ destination, label });
      return false; // Block navigation
    } else {
      navigate(destination);
      return true; // Allow navigation
    }
  }, [shouldBlock, navigate]);

  const handleConfirm = useCallback(() => {
    if (pendingNavigation) {
      // Clear all scouting data from localStorage before navigating away
      clearScoutingLocalStorage();
      
      navigate(pendingNavigation.destination);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, navigate]);

  const handleCancel = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  return {
    confirmNavigation,
    handleConfirm,
    handleCancel,
    isConfirmDialogOpen: pendingNavigation !== null,
    pendingDestinationLabel: pendingNavigation?.label || 'this page'
  };
}
