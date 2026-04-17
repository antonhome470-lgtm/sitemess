
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  Trash2, 
  ChevronLeft,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import { Contact, Message, ChatState } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { cn } from './utils/cn';

const CONTACTS: Contact[] = [
  { id: '1', name: 'Александр Иванов', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', lastSeen: '10:45', online: true },
  { id: '2', name: 'Мария Петрова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', lastSeen: 'вчера', online: false },
  { id: '3', name: 'Дмитрий Соколов', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry', lastSeen: '09:15', online: true },
  { id: '4', name: 'Елена Смирнова', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', lastSeen: '2 часа назад', online: false },
  { id: '5', name: 'Техподдержка', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Support', lastSeen: 'онлайн', online: true },
];

const BOT_RESPONSES = [
  "Привет! Как я могу помочь?",
  "Интересно, расскажи подробнее.",
  "Я обязательно передам это команде.",
  "Извини, я всего лишь демонстрационный бот.",
  "Отличное сообщение! 👍",
  "Ха-ха, это забавно!",
];

export default function App() {
  const [chats, setChats] = useLocalStorage<ChatState>('messenger_history', {});
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = CONTACTS.find(c => c.id === activeContactId);
  const currentMessages = activeContactId ? chats[activeContactId] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentMessages, newMessage];
    setChats({
      ...chats,
      [activeContactId]: updatedMessages,
    });
    setInputText('');

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: activeContactId,
        text: BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)],
        timestamp: Date.now(),
      };
      
      setChats(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), botMessage],
      }));
      setIsTyping(false);
    }, 1500);
  };

  const clearHistory = () => {
    if (confirm('Очистить историю всех переписок?')) {
      setChats({});
    }
  };

  const filteredContacts = CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 flex flex-col transition-all duration-300",
        isMobileView ? (showMobileChat ? "w-0 overflow-hidden" : "w-full") : "w-[350px]"
      )}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Messenger
          </h1>
          <button 
            onClick={clearHistory}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Очистить всё"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск контактов..."
              className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => {
            const lastMsg = (chats[contact.id] || []).slice(-1)[0];
            return (
              <button
                key={contact.id}
                onClick={() => {
                  setActiveContactId(contact.id);
                  if (isMobileView) setShowMobileChat(true);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left",
                  activeContactId === contact.id && "bg-blue-50 border-r-4 border-blue-500"
                )}
              >
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full border border-slate-100" />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold truncate">{contact.name}</h3>
                    <span className="text-xs text-slate-400">{contact.lastSeen}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {lastMsg ? (lastMsg.senderId === 'me' ? `Вы: ${lastMsg.text}` : lastMsg.text) : 'Начните общение...'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className={cn(
        "flex-1 flex flex-col bg-white",
        isMobileView && !showMobileChat && "hidden"
      )}>
        {activeContact ? (
          <>
            {/* Header */}
            <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button onClick={() => setShowMobileChat(false)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                )}
                <div className="relative">
                  <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full" />
                  {activeContact.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold leading-none">{activeContact.name}</h2>
                  <span className="text-xs text-slate-400">
                    {activeContact.online ? 'В сети' : `Был(а) ${activeContact.lastSeen}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <Search size={20} />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {currentMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Smile size={32} />
                  </div>
                  <p>Здесь пока пусто. Напишите первым!</p>
                </div>
              )}
              {currentMessages.map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm relative",
                      isMe 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    )}>
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                      <div className={cn(
                        "text-[10px] mt-1 flex justify-end",
                        isMe ? "text-blue-100" : "text-slate-400"
                      )}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex gap-1">
                    <Circle className="w-1.5 h-1.5 fill-slate-400 animate-bounce" />
                    <Circle className="w-1.5 h-1.5 fill-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <Circle className="w-1.5 h-1.5 fill-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-5xl mx-auto">
                <div className="flex mb-2">
                  <button type="button" className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                    <Paperclip size={22} />
                  </button>
                  <button type="button" className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                    <ImageIcon size={22} />
                  </button>
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ваше сообщение..."
                    className="w-full bg-slate-100 border-none rounded-2xl py-3 px-4 pr-12 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-[15px] resize-none max-h-32"
                  />
                  <button type="button" className="absolute right-2 bottom-2 p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                    <Smile size={22} />
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className={cn(
                    "mb-1 p-3 rounded-full transition-all",
                    inputText.trim() 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95" 
                      : "bg-slate-100 text-slate-300"
                  )}
                >
                  <Send size={22} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
              <Send size={40} className="text-blue-500 -rotate-45 -mr-2" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Выберите контакт</h2>
            <p className="mt-2 text-center max-w-xs">
              Выберите чат из списка слева, чтобы начать общение.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
