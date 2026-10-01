import { useState } from 'react';
import { Maximize2, Minimize2, Send, SquarePen } from 'lucide-react';
import brandMark from '../../assets/brand-mark.svg';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ErrorText from '../../components/ui/ErrorText';
import Input from '../../components/ui/Input';
import { useGet } from '../../hooks/useGet';
import { useSend } from '../../hooks/useSend';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';

const MAX_LENGTH = 2000;

// The two quick actions just send a ready-made question.
const QUICK_ACTIONS = [
  { label: 'Summarize issue', pending: 'Summarizing…', prompt: 'Summarize this issue in 1-2 sentences.' },
  {
    label: 'Analyze issue',
    pending: 'Analyzing…',
    prompt: 'Analyze this issue: predict its severity (low, medium, high or critical), classify it (bug, feature request, performance, security…) and suggest a fix.',
  },
];

const ICON_BUTTON = 'flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

const PILL = 'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60';

// The chat itself. It's rendered twice (side panel and the expanded dialog);
// both read the same cached data, so they always match.
export default function ChatPanel({ issue, me, className, isExpanded, onToggleExpand }) {
  const path = `/teams/${issue.team_id}/issues/${issue._id}/chat`;
  const { data: messages = [], isPending } = useGet(path);
  const send = useSend(path);
  const clear = useSend(path);
  const [draft, setDraft] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const pending = send.isPending ? send.variables.body.message : null;
  const hasActivity = messages.length > 0 || pending;

  function ask(message) {
    setDraft('');
    // Put the text back if sending fails, so nothing typed is lost.
    send.mutate({ path, body: { message } }, { onError: () => setDraft(message) });
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <span className="text-sm font-semibold text-slate-300">Chat</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onToggleExpand} title={isExpanded ? 'Collapse' : 'Expand'} className={ICON_BUTTON}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setIsClearing(true)} disabled={!messages.length} title="Start a new chat" className={ICON_BUTTON}>
            <SquarePen className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Centered only while empty: a centered column that overflows can't be scrolled to its top. */}
      <div className={`flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 text-center ${!hasActivity ? 'items-center justify-center' : ''}`}>
        {isPending && <p className="text-xs text-slate-500">Loading chat…</p>}
        {!isPending && !hasActivity && (
          <>
            <img src={brandMark} alt="" className="h-12 w-12 opacity-10" />
            <p className="text-xs text-slate-500">Ask about this issue, or try Summarize or Analyze below.</p>
          </>
        )}
        {hasActivity && (
          <div className="flex w-full flex-col gap-3 text-left">
            {messages.map((message) => <ChatBubble key={message._id} message={message} me={me} />)}
            {pending && (
              <>
                <ChatBubble message={{ role: 'user', text: pending }} me={me} />
                <TypingIndicator />
              </>
            )}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button key={action.label} type="button" disabled={send.isPending} onClick={() => ask(action.prompt)} className={PILL}>
              {pending === action.prompt ? action.pending : action.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(draft.trim()); }} className="border-t border-white/10 p-4">
        <ErrorText error={send.error} className="mb-2 text-xs" />
        <div className="flex items-center gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={send.isPending} placeholder="Ask about this issue…" className="flex-1 text-sm" />
          <button
            type="submit"
            disabled={!draft.trim() || [...draft].length > MAX_LENGTH || send.isPending}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-400 transition-colors hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-slate-400"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={isClearing}
        onClose={() => setIsClearing(false)}
        title="Start a new chat"
        confirmLabel="Delete and start over"
        pendingLabel="Deleting…"
        action={clear}
        onConfirm={() => clear.mutate({ path, method: 'DELETE' }, { onSuccess: () => setIsClearing(false) })}
      >
        This permanently deletes your conversation about this issue. This cannot be undone.
      </ConfirmModal>
    </div>
  );
}
