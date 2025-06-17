import React, { useState } from 'react';
import { Send, Image, Trash, Check, AlertCircle } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { TelegramChat } from '../types/telegram';

const MessageForm: React.FC = () => {
  const {
    token,
    chats,
    sendTextMessage,
    sendImageMessage,
    loading,
    error,
    selectedChatId,
    setSelectedChatId,
    forumTopics,
  } = useTelegram();
  const [message, setMessage] = useState('');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<'text' | 'image'>('text');
  const [success, setSuccess] = useState<string | null>(null);
  const [manualChatId, setManualChatId] = useState('');
  const [threadId, setThreadId] = useState('');
  const [sendMethod, setSendMethod] = useState<'list' | 'custom'>('list');
  
  if (!token) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetId = sendMethod === 'custom' ? manualChatId : selectedChatId;
    if (!targetId) return;
    
    try {
      let result;
      
      const thread = threadId ? parseInt(threadId, 10) : undefined;

      if (messageType === 'text') {
        result = await sendTextMessage(targetId, message, thread);
      } else if (messageType === 'image' && image) {
        result = await sendImageMessage(targetId, image, caption, thread);
      }
      
      if (result && result.ok) {
        setSuccess('Message sent successfully!');
        setMessage('');
        setCaption('');
        setImage(null);
        setManualChatId('');
        setThreadId('');
        
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">Send Message</h2>
      </div>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center animate-fadeIn">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Send Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Send Method</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setSendMethod('list');
                setManualChatId('');
              }}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                sendMethod === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              From Chat List
            </button>
            <button
              type="button"
              onClick={() => {
                setSendMethod('custom');
                setSelectedChatId(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                sendMethod === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Custom User
            </button>
          </div>
        </div>
        {/* Selected Chat Info */}
        {sendMethod === 'list' && (
          selectedChat ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Sending to: <span className="font-medium">{selectedChat.title || selectedChat.username || `${selectedChat.first_name || ''} ${selectedChat.last_name || ''}`.trim() || `Chat ${selectedChat.id}`}</span>
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please select a chat from the list above to send a message
              </p>
            </div>
          )
        )}

        {/* Manual Chat ID */}
        {sendMethod === 'custom' && (
          <div>
            <label htmlFor="manual-chat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chat ID or Username
            </label>
            <input
              type="text"
              id="manual-chat"
              value={manualChatId}
              onChange={(e) => setManualChatId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="@channel or -1001234567890"
            />
          </div>
        )}

        {/* Thread Selection for Supergroups */}
        {sendMethod === 'list' && selectedChat && selectedChat.type === 'supergroup' && (
          <div>
            <label htmlFor="thread-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thread ID (optional)
            </label>
            <input
              type="number"
              id="thread-id"
              list="thread-options"
              value={threadId}
              onChange={(e) => setThreadId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Select or enter a thread ID"
            />
            {forumTopics[selectedChat.id] && forumTopics[selectedChat.id].length > 0 && (
              <datalist id="thread-options">
                {forumTopics[selectedChat.id].map((topic) => (
                  <option key={topic.message_thread_id} value={topic.message_thread_id}>
                    {topic.name ? topic.name : `Thread ${topic.message_thread_id}`}
                  </option>
                ))}
              </datalist>
            )}
          </div>
        )}

        {/* Message Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message Type
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setMessageType('text')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                messageType === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setMessageType('image')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                messageType === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Image
            </button>
          </div>
        </div>
        
        {/* Text Message Input */}
        {messageType === 'text' && (
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your message"
              required
            />
          </div>
        )}
        
        {/* Image Upload */}
        {messageType === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image
            </label>
            
            {!image ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-300">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                      <span>Upload an image</span>
                      <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} required />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {image.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add a caption to your image"
              />
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={
              loading ||
              (sendMethod === 'custom' ? !manualChatId : !selectedChatId) ||
              (messageType === 'text' && !message) ||
              (messageType === 'image' && !image)
            }
            className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading || (sendMethod === 'custom' ? !manualChatId : !selectedChatId) || (messageType === 'text' && !message) || (messageType === 'image' && !image)
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors duration-200`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageForm;