import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center py-2">
        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-danger-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-danger-500" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-surface-900 mb-2">{title}</h3>
        <p className="text-sm text-surface-500 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} className="w-full sm:w-auto">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
