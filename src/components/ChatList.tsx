import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, User, UserPlus, MessageSquare } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { TelegramChat } from '../types/telegram';

const ChatList: React.FC = () => {
  const { token, chats, fetchChats, loading, error, selectedChatId, setSelectedChatId } = useTelegram();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (token) {
      fetchChats();
    }
  }, [token]);

  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'group':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'supergroup':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'channel':
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getChatName = (chat: TelegramChat) => {
    if (chat.title) return chat.title;
    if (chat.username) return `@${chat.username}`;
    if (chat.first_name) {
      return chat.last_name 
        ? `${chat.first_name} ${chat.last_name}`
        : chat.first_name;
    }
    return `Chat ID: ${chat.id}`;
  };

  const filteredChats = chats.filter(chat => {
    if (filter === 'all') return true;
    return chat.type === filter;
  });

  if (!token) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">Chat List</h2>
        </div>
        
        <button 
          onClick={() => fetchChats()} 
          disabled={loading}
          className={`p-2 rounded-full ${loading 
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`py-2 px-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
            filter === 'all'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('private')}
          className={`py-2 px-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
            filter === 'private'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Private
        </button>
        <button
          onClick={() => setFilter('group')}
          className={`py-2 px-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
            filter === 'group'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Groups
        </button>
        <button
          onClick={() => setFilter('supergroup')}
          className={`py-2 px-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
            filter === 'supergroup'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Supergroups
        </button>
        <button
          onClick={() => setFilter('channel')}
          className={`py-2 px-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
            filter === 'channel'
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Channels
        </button>
      </div>
      
      {loading && <p className="text-gray-600 dark:text-gray-300 py-4 text-center">Loading chats...</p>}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1">
            Make sure your bot has had some interactions with users to display chats.
          </p>
        </div>
      )}
      
      {!loading && !error && filteredChats.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">No chats found. Your bot needs to have interactions with users to display chats.</p>
        </div>
      )}
      
      {filteredChats.length > 0 && (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredChats.map((chat) => (
            <li 
              key={chat.id} 
              onClick={() => setSelectedChatId(chat.id)}
              className={`py-3 flex items-center animate-fadeIn transition-colors hover:bg-blue-100 dark:hover:bg-blue-800 px-2 rounded-md cursor-pointer ${
                selectedChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="min-w-0 flex-1 flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {getChatTypeIcon(chat.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getChatName(chat)}
                  </p>
                  <div className="flex items-center text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      chat.type === 'private' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      chat.type === 'group' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      chat.type === 'supergroup' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    }`}>
                      {chat.type}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      ID: {chat.id}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;