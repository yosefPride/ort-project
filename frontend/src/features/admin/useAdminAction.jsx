import { useState } from 'react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useSend } from '../../hooks/useSend';

// One confirm dialog for every admin action: `pending` holds what's about to happen.
export function useAdminAction() {
  const [pending, setPending] = useState(null); // { title, confirmLabel, variant, message, method, path, body }
  const action = useSend('/admin');
  const modal = (
    <ConfirmModal
      isOpen={pending !== null}
      onClose={() => setPending(null)}
      title={pending?.title}
      confirmLabel={pending?.confirmLabel}
      pendingLabel="Working…"
      variant={pending?.variant}
      action={action}
      onConfirm={() => action.mutate(pending, { onSuccess: () => setPending(null) })}
    >
      {pending?.message}
    </ConfirmModal>
  );
  return [setPending, modal];
}
