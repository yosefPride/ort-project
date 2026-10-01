import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import ChatPanel from './ChatPanel';

// Private to the signed-in user: nobody else sees their conversation.
export default function AiChat({ issue, me }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <ChatPanel
        issue={issue}
        me={me}
        className="flex h-132 flex-col rounded-xl border border-white/10 bg-white/5 lg:h-auto lg:min-h-0 lg:flex-1"
        onToggleExpand={() => setIsExpanded(true)}
      />
      <Dialog.Root open={isExpanded} onOpenChange={setIsExpanded}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 flex h-[calc(100%-4rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50"
          >
            <Dialog.Title className="sr-only">Chat</Dialog.Title>
            <ChatPanel issue={issue} me={me} className="flex h-full flex-col" isExpanded onToggleExpand={() => setIsExpanded(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
