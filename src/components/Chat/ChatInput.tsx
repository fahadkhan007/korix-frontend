import { useState } from 'react';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter alone = send. Shift+Enter = new line (default browser behaviour)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-textarea"
        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      <button
        className="chat-send-btn"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        Send
      </button>
    </div>
  );
}
