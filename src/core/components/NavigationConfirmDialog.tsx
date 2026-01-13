import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface NavigationConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  destinationLabel?: string;
}

export function NavigationConfirmDialog({ 
  open, 
  onConfirm, 
  onCancel, 
  destinationLabel = "this page" 
}: NavigationConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Leave Scouting Session?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>
                You are currently in the middle of scouting a match. If you navigate to{' '}
                <span className="font-medium">{destinationLabel}</span>, all unsaved match data will be lost.
              </p>
              <p className="text-sm text-muted-foreground">
                This includes any autonomous actions, teleop scoring, and other data you've recorded for this match.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className='p-2'>
            Continue Scouting
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            className="p-2 text-white"
          >
            Leave and Lose Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
