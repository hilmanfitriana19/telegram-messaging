import React from 'react';
import { TelegramProvider } from './context/TelegramContext';
import Layout from './components/Layout';
import TokenInput from './components/TokenInput';
import ChatList from './components/ChatList';
import MessageForm from './components/MessageForm';

function App() {
  return (
    <TelegramProvider>
      <Layout>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Telegram Messaging Dashboard
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect your Telegram bot, view your chats, and send messages to individuals or groups. 
          This dashboard provides a simple interface to manage your Telegram messaging needs.
        </p>
        
        <TokenInput />
        <ChatList />
        <MessageForm />
      </Layout>
    </TelegramProvider>
  );
}

export default App;