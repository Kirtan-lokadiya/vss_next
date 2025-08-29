import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Header from '../src/components/ui/Header';
import Icon from '../src/components/AppIcon';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats] = useState([
    {
      id: 1,
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      time: '2:30 PM',
      unread: 2,
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      lastMessage: 'Thanks for the connection!',
      time: '1:15 PM',
      unread: 0,
      avatar: null
    }
  ]);
  const [messages] = useState({
    1: [
      { id: 1, text: 'Hey, how are you?', sender: 'other', time: '2:30 PM' },
      { id: 2, text: 'I\'m good, thanks! How about you?', sender: 'me', time: '2:31 PM' }
    ],
    2: [
      { id: 1, text: 'Thanks for the connection!', sender: 'other', time: '1:15 PM' },
      { id: 2, text: 'You\'re welcome!', sender: 'me', time: '1:16 PM' }
    ]
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    // Add message logic here
    setMessage('');
  };

  return (
    <>
      <Head>
        <title>Messages - VSS</title>
      </Head>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 h-screen flex">
          {/* Chat List */}
          <div className="w-80 border-r border-border bg-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold">Messages</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      {chat.avatar ? (
                        <img src={chat.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {chat.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{chat.name}</h3>
                        <span className="text-xs text-text-secondary">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    {selectedChat.avatar ? (
                      <img src={selectedChat.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold">
                        {selectedChat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedChat.name}</h3>
                    <p className="text-sm text-text-secondary">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages[selectedChat.id]?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.sender === 'me'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'me' ? 'text-white/70' : 'text-text-secondary'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Icon name="Send" size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="MessageCircle" size={64} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                  <p className="text-text-secondary">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;