import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { TelegramBot, TelegramChat, SendMessageResponse, StoredToken, ForumTopic } from '../types/telegram';

interface TelegramContextType {
  token: string;
  setToken: (token: string) => void;
  botInfo: TelegramBot | null;
  setBotInfo: (info: TelegramBot | null) => void;
  chats: TelegramChat[];
  setChats: (chats: TelegramChat[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  selectedChatId: number | null;
  setSelectedChatId: (id: number | null) => void;
  storedTokens: StoredToken[];
  addStoredToken: (token: string, botInfo: TelegramBot) => void;
  removeStoredToken: (token: string) => void;
  selectStoredToken: (token: string) => void;
  verifyToken: (token: string) => Promise<boolean>;
  fetchChats: () => Promise<void>;
  sendTextMessage: (chatId: number | string, text: string, threadId?: number) => Promise<SendMessageResponse | null>;
  sendImageMessage: (chatId: number | string, image: File, caption?: string, threadId?: number) => Promise<SendMessageResponse | null>;
  forumTopics: Record<number, ForumTopic[]>;
  clearData: () => void;
}

const STORAGE_KEY = 'telegram_tokens';

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>('');
  const [botInfo, setBotInfo] = useState<TelegramBot | null>(null);
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [storedTokens, setStoredTokens] = useState<StoredToken[]>([]);
  const [forumTopics, setForumTopics] = useState<Record<number, ForumTopic[]>>({});

  // Load stored tokens on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStoredTokens(JSON.parse(stored));
    }
  }, []);

  const addStoredToken = (token: string, botInfo: TelegramBot) => {
    setStoredTokens((prev) => {
      const existingIndex = prev.findIndex(t => t.token === token);
      const newEntry: StoredToken = {
        token,
        botInfo,
        addedAt: Date.now(),
      };
      let updated;
      if (existingIndex !== -1) {
        updated = [...prev];
        updated[existingIndex] = newEntry;
      } else {
        updated = [...prev, newEntry];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeStoredToken = (tokenToRemove: string) => {
    const updatedTokens = storedTokens.filter(t => t.token !== tokenToRemove);
    setStoredTokens(updatedTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
    
    if (token === tokenToRemove) {
      clearData();
    }
  };

  const selectStoredToken = (selectedToken: string) => {
    const found = storedTokens.find(t => t.token === selectedToken);
    if (found) {
      setToken(found.token);
      setBotInfo(found.botInfo);
      setSelectedChatId(null);
      setChats([]);
      fetchChats();
    }
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (!data.ok) {
        setError(data.description || 'Invalid token');
        setBotInfo(null);
        setLoading(false);
        return false;
      }
      
      setBotInfo(data.result);
      setToken(token);
      addStoredToken(token, data.result);
      setLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setError('Failed to verify token');
      setBotInfo(null);
      setLoading(false);
      return false;
    }
  };

  const fetchChats = useCallback(async (): Promise<void> => {
    if (!token) {
      setError('No token provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
      const data = await response.json();

      if (!data.ok) {
        setError(data.description || 'Failed to fetch chats');
        setLoading(false);
        return;
      }

      // Extract unique chats from updates and collect forum topics
      const uniqueChats = new Map<number, TelegramChat>();
      const topicsMap: Record<number, ForumTopic[]> = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.result.forEach((update: any) => {
        if (update.message && update.message.chat) {
          const chat = update.message.chat;
          uniqueChats.set(chat.id, chat);

          if (update.message.message_thread_id) {
            const threadId = update.message.message_thread_id as number;
            const name = update.message.forum_topic_created?.name as string | undefined;
            const title = update.message.chat?.title;
            if (!topicsMap[chat.id]) {
              topicsMap[chat.id] = [];
            }
            if (!topicsMap[chat.id].some(t => t.message_thread_id === threadId)) {
              topicsMap[chat.id].push({ message_thread_id: threadId, name, title });
            }
          }
        }
      });

      setChats(Array.from(uniqueChats.values()));
      setForumTopics(prev => ({ ...prev, ...topicsMap }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch chats');
      setLoading(false);
    }
  }, [token]);

  const sendTextMessage = useCallback(
    async (
      chatId: number | string,
      text: string,
      threadId?: number,
    ): Promise<SendMessageResponse | null> => {
      if (!token) {
        setError('No token provided');
        return null;
      }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          ...(threadId ? { message_thread_id: threadId } : {}),
        }),
      });
      
      const data = await response.json();
      
      setLoading(false);
      
      if (!data.ok) {
        setError(data.description || 'Failed to send message');
      }
      
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to send message');
      setLoading(false);
      return null;
    }
    },
    [token],
  );

  const sendImageMessage = useCallback(
    async (
      chatId: number | string,
      image: File,
      caption?: string,
      threadId?: number,
    ): Promise<SendMessageResponse | null> => {
      if (!token) {
        setError('No token provided');
        return null;
      }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      formData.append('photo', image);

      if (caption) {
        formData.append('caption', caption);
      }
      if (threadId) {
        formData.append('message_thread_id', threadId.toString());
      }
      
      const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      setLoading(false);
      
      if (!data.ok) {
        setError(data.description || 'Failed to send image');
      }
      
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to send image');
      setLoading(false);
      return null;
    }
    },
    [token],
  );

  const clearData = () => {
    setToken('');
    setBotInfo(null);
    setChats([]);
    setError(null);
    setSelectedChatId(null);
  };

  return (
    <TelegramContext.Provider
      value={{
        token,
        setToken,
        botInfo,
        setBotInfo,
        chats,
        setChats,
        loading,
        setLoading,
        error,
        setError,
        selectedChatId,
        setSelectedChatId,
        storedTokens,
        addStoredToken,
        removeStoredToken,
        selectStoredToken,
        verifyToken,
        fetchChats,
        sendTextMessage,
        sendImageMessage,
        forumTopics,
        clearData,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = (): TelegramContextType => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};