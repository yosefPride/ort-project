import { useEffect, useRef, useState } from 'react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ErrorText from '../../components/ui/ErrorText';
import Loading from '../../components/ui/Loading';
import Textarea from '../../components/ui/Textarea';
import { useGet } from '../../hooks/useGet';
import { useMembers } from '../../hooks/useMembers';
import { useSend } from '../../hooks/useSend';
import { formatDateTime, formatRelativeTime } from '../../utils/dates';
import EmojiPicker from './EmojiPicker';
import Reactions from './Reactions';

const MAX_LENGTH = 2000;

// Chat-style thread: your own comments on the right, everyone else's on the left.
export default function Comments({ issue, me, isAdmin, isVisible }) {
  const path = `/teams/${issue.team_id}/issues/${issue._id}/comments`;
  const { data: comments, status, error } = useGet(path);
  const { nameOf } = useMembers(issue.team_id);
  const send = useSend(path);
  const [body, setBody] = useState('');
  const [deleting, setDeleting] = useState(null);
  const threadRef = useRef(null);
  const textareaRef = useRef(null);
  const length = [...body].length; // counts emoji as one character, like the backend

  // Newest comment is at the bottom, so scroll there when the thread changes or the tab opens.
  useEffect(() => {
    if (isVisible && threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [comments, isVisible]);

  const react = (comment, emoji) =>
    send.mutate({ path: `${path}/${comment._id}/reaction`, method: emoji ? 'PUT' : 'DELETE', body: emoji ? { emoji } : undefined });

  // Puts the emoji where the cursor is and keeps the focus in the box.
  function insertEmoji(char) {
    const node = textareaRef.current;
    const start = node?.selectionStart ?? body.length;
    setBody(body.slice(0, start) + char + body.slice(node?.selectionEnd ?? body.length));
    requestAnimationFrame(() => {
      node?.focus();
      node?.setSelectionRange(start + char.length, start + char.length);
    });
  }

  function submit(e) {
    e.preventDefault();
    send.mutate({ path, body: { body } }, { onSuccess: () => setBody('') });
  }

  if (status === 'pending') return <Loading text="Loading comments…" />;
  if (status === 'error') return <ErrorText error={error} />;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
        {comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
        <ul>
          {comments.map((comment) => {
            const isOwn = comment.author_id === me._id;
            return (
              <li key={comment._id}>
                <article className={`flex w-[60%] flex-col gap-1 py-2 ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Avatar name={nameOf(comment.author_id)} seed={comment.author_id} size="sm" />
                    <span>
                      {nameOf(comment.author_id)} · <span title={formatDateTime(comment.created_at)}>{formatRelativeTime(comment.created_at)}</span>
                    </span>
                  </p>
                  <div className={`w-full rounded-2xl px-3 py-2 ${isOwn ? 'rounded-tr-sm bg-sky-600/30' : 'rounded-tl-sm bg-white/10'}`}>
                    <p className="whitespace-pre-wrap break-words text-sm text-slate-200">{comment.body}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Reactions comment={comment} myId={me._id} onReact={(emoji) => react(comment, emoji)} />
                    {(isOwn || isAdmin) && (
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleting(comment)}>Delete</Button>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      {/* A closed issue takes no new comments, so the box is removed rather than disabled. */}
      {issue.status === 'open' && (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <Textarea ref={textareaRef} value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Add a comment…" className="text-sm" />
          {!deleting && <ErrorText error={send.error} />}
          <div className="flex items-center justify-end gap-3">
            <EmojiPicker onSelect={insertEmoji} />
            <span className={`mr-auto text-xs ${length > MAX_LENGTH ? 'text-red-400' : 'text-slate-500'}`}>{length} / {MAX_LENGTH}</span>
            <Button type="submit" size="sm" disabled={!body.trim() || length > MAX_LENGTH || send.isPending}>
              {send.isPending ? 'Posting…' : 'Comment'}
            </Button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete comment"
        confirmLabel="Delete comment"
        pendingLabel="Deleting…"
        action={send}
        onConfirm={() => send.mutate({ path: `${path}/${deleting._id}`, method: 'DELETE' }, { onSuccess: () => setDeleting(null) })}
      >
        Are you sure you want to delete this comment? This cannot be undone.
      </ConfirmModal>
    </div>
  );
}
