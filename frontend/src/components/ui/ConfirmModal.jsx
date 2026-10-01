import Button from './Button';
import ErrorText from './ErrorText';
import Modal from './Modal';

// "Are you sure?" dialog. `action` is a useSend() mutation; it can't be closed while running.
export default function ConfirmModal({ isOpen, onClose, title, confirmLabel, pendingLabel, variant = 'danger', action, onConfirm, children }) {
  function close() {
    if (action.isPending) return;
    action.reset(); // so an old error isn't shown the next time it opens
    onClose();
  }
  return (
    <Modal isOpen={isOpen} onClose={close} title={title}>
      <div className="text-sm text-slate-300">{children}</div>
      <ErrorText error={action.error} className="mt-3" />
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" disabled={action.isPending} onClick={close}>Cancel</Button>
        <Button variant={variant} disabled={action.isPending} onClick={onConfirm}>
          {action.isPending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
