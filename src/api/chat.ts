import api from './axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageSender {
  id: string;
  name: string | null;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  messageType: 'TEXT' | 'SYSTEM' | 'AI';
  createdAt: string;
  sender: MessageSender;
}

export interface Conversation {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const chatService = {
  // GET /api/projects/:projectId/conversations
  // Returns the "General" conversation for the project
  getConversation: async (projectId: string): Promise<{ conversation: Conversation }> => {
    const response = await api.get(`/projects/${projectId}/conversations`);
    return response.data;
  },

  // GET /api/projects/:projectId/conversations/:conversationId/messages
  // Returns last 50 messages, newest first — reverse before displaying
  // Pass cursor (message id) to load older messages above
  getMessages: async (
    projectId: string,
    conversationId: string,
    cursor?: string
  ): Promise<{ messages: Message[] }> => {
    const params = cursor ? { cursor } : {};
    const response = await api.get(
      `/projects/${projectId}/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },
};
