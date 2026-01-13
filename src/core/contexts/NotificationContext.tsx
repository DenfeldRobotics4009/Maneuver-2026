/**
 * NotificationContext - Toast notification system
 * Framework context - game-agnostic
 * 
 * Provides a centralized notification system for displaying
 * toast messages, alerts, and confirmations.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => string;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  
  // Convenience methods
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
  /**
   * Default duration for notifications in milliseconds
   * Default: 5000 (5 seconds)
   */
  defaultDuration?: number;
  
  /**
   * Maximum number of notifications to show at once
   * Default: 5
   */
  maxNotifications?: number;
}

export function NotificationProvider({
  children,
  defaultDuration = 5000,
  maxNotifications = 5
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (notification: Omit<Notification, 'id'>): string => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const duration = notification.duration ?? defaultDuration;

      const newNotification: Notification = {
        ...notification,
        id,
        duration
      };

      setNotifications((prev) => {
        const updated = [...prev, newNotification];
        // Keep only the most recent notifications
        return updated.slice(-maxNotifications);
      });

      // Auto-dismiss if duration > 0
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }

      return id;
    },
    [defaultDuration, maxNotifications]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, title?: string) => {
      return showNotification({ type: 'success', message, title });
    },
    [showNotification]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      return showNotification({ type: 'error', message, title, duration: 0 });
    },
    [showNotification]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      return showNotification({ type: 'warning', message, title });
    },
    [showNotification]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      return showNotification({ type: 'info', message, title });
    },
    [showNotification]
  );

  const value: NotificationContextValue = {
    notifications,
    showNotification,
    dismissNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
