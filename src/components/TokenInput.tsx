import React, { useState } from 'react';
import { Bot, Key, Check, AlertCircle } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';

const TokenInput: React.FC = () => {
  const { verifyToken, loading, error, botInfo } = useTelegram();
  const [token, setToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyToken(token);
    setIsVerified(success);
  };

  if (isVerified && botInfo) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 animate-fadeIn">
        <div className="flex items-center">
          <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">Token Verified</h2>
        </div>
        <div className="mt-4 pl-11">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Bot ID</p>
              <p className="font-medium text-gray-900 dark:text-white">{botInfo.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Username</p>
              <p className="font-medium text-gray-900 dark:text-white">@{botInfo.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{botInfo.first_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Type</p>
              <p className="font-medium text-gray-900 dark:text-white">{botInfo.is_bot ? 'Bot' : 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">Connect to Telegram</h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Enter your Telegram bot token to start using the messaging dashboard.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
            placeholder="Enter your bot token"
            required
          />
        </div>
        
        {error && (
          <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || !token}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
            loading || !token
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          } transition-colors duration-200`}
        >
          {loading ? 'Verifying...' : 'Verify Token'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Don't have a bot token? <a href="https://core.telegram.org/bots#how-do-i-create-a-bot" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Learn how to create a bot</a></p>
      </div>
    </div>
  );
};

export default TokenInput;