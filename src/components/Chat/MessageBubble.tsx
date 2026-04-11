import type { Message } from '../../api/chat';

interface Props {
  message: Message;
  currentUserId: string;
}

export default function MessageBubble({ message, currentUserId }: Props) {
  const isOwn = message.sender.id === currentUserId;
  const senderName = message.sender.name || message.sender.email;
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
      {/* Only show sender name for messages from others */}
      {!isOwn && <span className="bubble-sender">{senderName}</span>}
      <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        <p className="bubble-content">{message.content}</p>
        <span className="bubble-time">{time}</span>
      </div>
    </div>
  );
}
