/**
 * Toaster - Notification display component
 * Framework component - game-agnostic
 * 
 * Displays toast notifications from the NotificationContext
 */

import { X } from 'lucide-react';
import { useNotifications, type Notification } from '@/core/contexts/NotificationContext';
import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/lib/utils';

interface ToasterProps {
  /**
   * Position of the toaster
   * Default: 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * Maximum width of notifications
   * Default: '384px' (24rem)
   */
  maxWidth?: string;
}

export function Toaster({ position = 'bottom-right', maxWidth = '384px' }: ToasterProps) {
  const { notifications, dismissNotification } = useNotifications();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        positionClasses[position]
      )}
      style={{ maxWidth }}
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  notification: Notification;
  onDismiss: () => void;
}

function ToastItem({ notification, onDismiss }: ToastItemProps) {
  const { type, title, message, action } = notification;

  const typeStyles = {
    success: 'bg-green-50 border-green-500 text-green-900 dark:bg-green-950 dark:text-green-100',
    error: 'bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:text-red-100',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
    info: 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950 dark:text-blue-100'
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full flex-col gap-2 rounded-lg border-l-4 p-4 shadow-lg',
        'animate-in slide-in-from-right fade-in duration-300',
        typeStyles[type]
      )}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {title && (
            <div className="font-semibold text-sm mb-1">{title}</div>
          )}
          <div className="text-sm">{message}</div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
          className="self-start"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
