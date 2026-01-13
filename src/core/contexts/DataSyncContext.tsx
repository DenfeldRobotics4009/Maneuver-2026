/**
 * DataSyncContext - Data synchronization state management
 * Framework context - game-agnostic
 * 
 * Manages the state of data synchronization operations
 * (QR codes, WebRTC, API sync, etc.)
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type SyncMethod = 'qr' | 'webrtc' | 'api' | 'manual';

export interface SyncOperation {
  id: string;
  method: SyncMethod;
  status: SyncStatus;
  startTime: number;
  endTime?: number;
  recordsTransferred: number;
  totalRecords?: number;
  error?: string;
}

interface DataSyncContextValue {
  // Current operations
  operations: SyncOperation[];
  
  // Active sync status
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Methods
  startSync: (method: SyncMethod, totalRecords?: number) => string;
  updateSync: (id: string, update: Partial<SyncOperation>) => void;
  completeSync: (id: string, recordsTransferred: number, error?: string) => void;
  clearHistory: () => void;
  
  // Stats
  getTotalRecordsSynced: () => number;
  getLastSuccessfulSync: () => SyncOperation | null;
}

const DataSyncContext = createContext<DataSyncContextValue | null>(null);

export function useDataSync() {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
}

interface DataSyncProviderProps {
  children: ReactNode;
  /**
   * Maximum number of operations to keep in history
   * Default: 50
   */
  maxHistory?: number;
}

export function DataSyncProvider({
  children,
  maxHistory = 50
}: DataSyncProviderProps) {
  const [operations, setOperations] = useState<SyncOperation[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const startSync = useCallback(
    (method: SyncMethod, totalRecords?: number): string => {
      const id = `sync-${Date.now()}-${Math.random()}`;
      
      const newOperation: SyncOperation = {
        id,
        method,
        status: 'syncing',
        startTime: Date.now(),
        recordsTransferred: 0,
        totalRecords
      };

      setOperations((prev) => {
        const updated = [...prev, newOperation];
        // Keep only the most recent operations
        return updated.slice(-maxHistory);
      });

      return id;
    },
    [maxHistory]
  );

  const updateSync = useCallback(
    (id: string, update: Partial<SyncOperation>) => {
      setOperations((prev) =>
        prev.map((op) =>
          op.id === id ? { ...op, ...update } : op
        )
      );
    },
    []
  );

  const completeSync = useCallback(
    (id: string, recordsTransferred: number, error?: string) => {
      const endTime = Date.now();
      
      setOperations((prev) =>
        prev.map((op) =>
          op.id === id
            ? {
                ...op,
                status: error ? 'error' : 'success',
                recordsTransferred,
                endTime,
                error
              }
            : op
        )
      );

      if (!error) {
        setLastSyncTime(endTime);
      }
    },
    []
  );

  const clearHistory = useCallback(() => {
    setOperations([]);
  }, []);

  const getTotalRecordsSynced = useCallback(() => {
    return operations
      .filter((op) => op.status === 'success')
      .reduce((total, op) => total + op.recordsTransferred, 0);
  }, [operations]);

  const getLastSuccessfulSync = useCallback(() => {
    const successful = operations
      .filter((op) => op.status === 'success')
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
    
    return successful[0] || null;
  }, [operations]);

  const isSyncing = operations.some((op) => op.status === 'syncing');

  const value: DataSyncContextValue = {
    operations,
    isSyncing,
    lastSyncTime,
    startSync,
    updateSync,
    completeSync,
    clearHistory,
    getTotalRecordsSynced,
    getLastSuccessfulSync
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
}
