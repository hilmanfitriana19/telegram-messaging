import React, { useState } from 'react';
import { Bot, Key, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { StoredToken } from '../types/telegram';

const TokenInput: React.FC = () => {
  const {
    verifyToken,
    loading,
    error,
    storedTokens,
    removeStoredToken,
    selectStoredToken,
    token: currentToken
  } = useTelegram();
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyToken(token);
    if (success) {
      setToken('');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStoredToken = (stored: StoredToken) => {
    const isActive = currentToken === stored.token;
    
    return (
      <div 
        key={stored.token}
        className={`p-4 rounded-lg border ${
          isActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700'
        } mb-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                @{stored.botInfo.username}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Added {formatDate(stored.addedAt)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {!isActive && (
              <button
                onClick={() => selectStoredToken(stored.token)}
                className="p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                title="Use this token"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => removeStoredToken(stored.token)}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              title="Remove token"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">Manage Telegram Bots</h2>
      </div>
      
      {storedTokens.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Saved Tokens
          </h3>
          {storedTokens.map(renderStoredToken)}
        </div>
      )}
      
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Add New Bot Token
        </h3>
        
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
            {loading ? 'Verifying...' : 'Add Token'}
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Don't have a bot token? <a href="https://core.telegram.org/bots#how-do-i-create-a-bot" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Learn how to create a bot</a></p>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;