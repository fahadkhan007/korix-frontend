import { useState, useEffect, useRef } from 'react';
import { chatService } from '../../api/chat';
import type { Message, Conversation } from '../../api/chat';
import socket from '../../socket/socket';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import './ChatPanel.css';

interface Props {
  projectId: string;
}

export default function ChatPanel({ projectId }: Props) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [socketReady, setSocketReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Step 1: Load conversation + message history via REST ─────────────
  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        const { conversation } = await chatService.getConversation(projectId);
        setConversation(conversation);

        // Server returns newest-first — reverse so oldest shows at top
        const { messages } = await chatService.getMessages(projectId, conversation.id);
        setMessages(messages.reverse());
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [projectId]);

  // ── Step 2: Connect socket + join room once we have the conversation ──
  useEffect(() => {
    if (!conversation) return;

    // Connect — auth token is read fresh from localStorage here
    socket.connect();

    // Tell the server we want to be in this conversation's room
    socket.emit('join-conversation', { conversationId: conversation.id });

    // Confirm socket is ready so ChatInput enables
    const handleConnect = () => setSocketReady(true);
    const handleDisconnect = () => setSocketReady(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If already connected (e.g. hot reload), mark ready immediately
    if (socket.connected) setSocketReady(true);

    // ── Step 3: Listen for real-time messages ─────────────────────────
    // When anyone in the room sends a message, server broadcasts 'new-message'
    // to all clients in the room — including the sender
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('new-message', handleNewMessage);

    // ── Cleanup: runs when component unmounts (user switches tab) ─────
    // MUST remove listeners to prevent duplicates on remount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new-message', handleNewMessage);
      socket.disconnect();
    };
  }, [conversation]);

  // ── Step 4: Auto-scroll to bottom whenever messages change ───────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Step 5: Send a message ────────────────────────────────────────────
  // We emit to server and let the server broadcast it back via 'new-message'
  // We do NOT add the message to state here — server is the source of truth
  const handleSend = (content: string) => {
    if (!conversation || !socket.connected) return;
    socket.emit('send-message', {
      conversationId: conversation.id,
      content,
    });
  };

  if (loading) {
    return (
      <div className="chat-panel chat-loading">
        <p>Loading chat…</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="chat-panel chat-loading">
        <p>No chat found for this project.</p>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">{conversation.name}</span>
        <span className={`chat-status-dot ${socketReady ? 'connected' : 'disconnected'}`} />
        <span className="chat-status-label">{socketReady ? 'Live' : 'Connecting…'}</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Say hello 👋</p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUserId={user?.id ?? ''}
          />
        ))}
        {/* Invisible anchor — we scroll here on new messages */}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={!socketReady} />
    </div>
  );
}
