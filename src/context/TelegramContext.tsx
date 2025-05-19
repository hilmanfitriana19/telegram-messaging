import React, { createContext, useState, useContext, ReactNode } from 'react';
import { TelegramBot, TelegramChat, SendMessageResponse } from '../types/telegram';

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
  verifyToken: (token: string) => Promise<boolean>;
  fetchChats: () => Promise<void>;
  sendTextMessage: (chatId: number, text: string) => Promise<SendMessageResponse | null>;
  sendImageMessage: (chatId: number, image: File, caption?: string) => Promise<SendMessageResponse | null>;
  clearData: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>('');
  const [botInfo, setBotInfo] = useState<TelegramBot | null>(null);
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

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
      setLoading(false);
      return true;
    } catch (error) {
      setError('Failed to verify token');
      setBotInfo(null);
      setLoading(false);
      return false;
    }
  };

  const fetchChats = async (): Promise<void> => {
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
      
      // Extract unique chats from updates
      const uniqueChats = new Map<number, TelegramChat>();
      
      data.result.forEach((update: any) => {
        if (update.message && update.message.chat) {
          uniqueChats.set(update.message.chat.id, update.message.chat);
        }
      });
      
      setChats(Array.from(uniqueChats.values()));
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch chats');
      setLoading(false);
    }
  };

  const sendTextMessage = async (chatId: number, text: string): Promise<SendMessageResponse | null> => {
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
        }),
      });
      
      const data = await response.json();
      
      setLoading(false);
      
      if (!data.ok) {
        setError(data.description || 'Failed to send message');
      }
      
      return data;
    } catch (error) {
      setError('Failed to send message');
      setLoading(false);
      return null;
    }
  };

  const sendImageMessage = async (chatId: number, image: File, caption?: string): Promise<SendMessageResponse | null> => {
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
    } catch (error) {
      setError('Failed to send image');
      setLoading(false);
      return null;
    }
  };

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
        verifyToken,
        fetchChats,
        sendTextMessage,
        sendImageMessage,
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