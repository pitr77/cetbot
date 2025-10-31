
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { Sender } from './types';
import type { ChatMessage } from './types';
import { createChatSession, sendMessageToBot } from './services/geminiService';
import BotIcon from './components/icons/BotIcon';
import UserIcon from './components/icons/UserIcon';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const chat = createChatSession();
      setChatSession(chat);
      setMessages([
        {
          id: `bot-${Date.now()}`,
          sender: Sender.BOT,
          text: "Hello! I'm an AI assistant. I can help explain how this website works. What would you like to know?",
        },
      ]);
    } catch (e) {
      console.error("Failed to initialize chat session:", e);
      setError("Sorry, I couldn't connect to the AI. Please check your API key and try again later.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: Sender.USER,
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendMessageToBot(chatSession, messageText);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: Sender.BOT,
        text: responseText,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Sorry, I ran into an issue: ${errorMessage}`);
      const errorBotMessage: ChatMessage = {
        id: `bot-error-${Date.now()}`,
        sender: Sender.BOT,
        text: "I'm sorry, I couldn't process your request right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden my-0 md:my-8">
      <header className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center space-x-3 bg-slate-50 dark:bg-gray-900/50">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <BotIcon className="w-7 h-7 text-white"/>
        </div>
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">AI Assistant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemini</p>
        </div>
      </header>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-center text-sm">
          {error}
        </div>
      )}

      <main className="flex-grow p-4 overflow-y-auto bg-slate-50 dark:bg-gray-800/50 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.sender === Sender.USER ? 'bg-blue-500' : 'bg-slate-600'}`}>
              {msg.sender === Sender.USER ? <UserIcon className="w-6 h-6 text-white"/> : <BotIcon className="w-6 h-6 text-white"/>}
            </div>
            <div className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-md ${msg.sender === Sender.USER ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 flex-row">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
              <BotIcon className="w-6 h-6 text-white"/>
            </div>
            <div className="max-w-xs md:max-w-md p-4 rounded-2xl shadow-md bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 rounded-bl-none">
                <div className="flex items-center justify-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
