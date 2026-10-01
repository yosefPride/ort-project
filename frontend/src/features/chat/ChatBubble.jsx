import brandMark from '../../assets/brand-mark.svg';
import Markdown from '../../components/Markdown';
import Avatar from '../../components/ui/Avatar';
import { formatDateTime, formatRelativeTime } from '../../utils/dates';

export default function ChatBubble({ message, me }) {
  const isAssistant = message.role === 'model';
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        {isAssistant ? <img src={brandMark} alt="" className="h-5 w-5 opacity-70" /> : <Avatar name={me.name} seed={me._id} size="sm" />}
        <span>
          {isAssistant ? 'Assistant' : me.name}
          {message.created_at && <> · <span title={formatDateTime(message.created_at)}>{formatRelativeTime(message.created_at)}</span></>}
        </span>
      </p>
      <div className={`break-words rounded-lg px-3 py-2 text-xs leading-relaxed ${isAssistant ? 'bg-black/30 text-slate-300' : 'whitespace-pre-wrap bg-sky-500/10 text-slate-200'}`}>
        {isAssistant ? <Markdown>{message.text}</Markdown> : message.text}
      </div>
    </div>
  );
}
