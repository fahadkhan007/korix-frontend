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
  const [aiTyping, setAiTyping] = useState(false);
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

    const conversationId = conversation.id;

    // ── Always emit join-conversation from INSIDE the connect handler ──
    // socket.connect() is async; if we emit immediately after it on an
    // already-connected socket the server might miss it. Doing it here
    // guarantees the server is ready before we join the room.
    const handleConnect = () => {
      socket.emit('join-conversation', { conversationId });
      setSocketReady(true);
    };
    const handleDisconnect = () => setSocketReady(false);
    const handleConnectError = (err: Error) => {
      console.error('[ChatPanel] socket connect_error:', err.message);
      setSocketReady(false);
    };
    const handleReconnectFailed = () => {
      console.error('[ChatPanel] socket reconnect_failed — giving up');
      setSocketReady(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    // If already connected when this effect runs, join the room immediately
    if (socket.connected) {
      socket.emit('join-conversation', { conversationId });
      setSocketReady(true);
    } else {
      socket.connect();
    }

    // ── Step 3: Listen for real-time messages ─────────────────────────
    // When anyone in the room sends a message, server broadcasts 'new-message'
    // to all clients in the room — including the sender
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setAiTyping(false); // clear typing indicator when AI reply arrives
    };

    // ── Step 3b: Listen for AI typing indicator ───────────────────────
    const handleAiTyping = ({ thinking }: { thinking: boolean }) => {
      setAiTyping(thinking);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('ai-typing', handleAiTyping);

    // ── Cleanup: runs when component unmounts (user switches tab) ─────
    // IMPORTANT: Do NOT call socket.disconnect() here — the socket is a module-level
    // singleton. Disconnecting kills any in-flight AI reply (Gemini can take 5-15s).
    // Just remove our listeners and let the socket stay alive.
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
      socket.off('new-message', handleNewMessage);
      socket.off('ai-typing', handleAiTyping);
    };
  }, [conversation]);


  // ── Step 4: Auto-scroll to bottom whenever messages or typing indicator changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

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

        {/* KorixAI typing indicator */}
        {aiTyping && (
          <div className="ai-typing-indicator">
            <span className="ai-typing-avatar">K</span>
            <div className="ai-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Invisible anchor — we scroll here on new messages */}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={!socketReady} />
    </div>
  );
}
