import React, { useState, useEffect } from 'react';
import { Bot, Sun, Moon } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';

const Header: React.FC = () => {
  const { botInfo } = useTelegram();
  const [darkMode, setDarkMode] = useState(false);

  // Check for user's preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
              Telegram Messenger
            </h1>
          </div>
          
          <div className="flex items-center">
            {botInfo && (
              <div className="mr-4 hidden md:block">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Connected as: <span className="font-medium text-blue-600 dark:text-blue-400">{botInfo.username}</span>
                </span>
              </div>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;