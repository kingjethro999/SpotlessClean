'use client';

import React from "react"

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  request_id: string;
  created_at: string;
  sender?: { full_name: string; role: string };
}

interface Conversation {
  requestId: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface AdminMessagingProps {
  staffId: string;
  staffName: string;
}

export function AdminMessaging({ staffId, staffName }: AdminMessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchConversations();
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchConversations();
          if (selectedRequest) {
            fetchMessages(selectedRequest);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRequest]);

  const fetchConversations = async () => {
    const { data: requests, error } = await supabase
      .from('cleaning_requests')
      .select('id, user_id, users (full_name)')
      .order('created_at', { ascending: false });

    if (error || !requests) {
      setLoading(false);
      return;
    }

    const conversationList: Conversation[] = [];

    for (const request of requests) {
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('request_id', request.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      conversationList.push({
        requestId: request.id,
        customerId: request.user_id,
        customerName: request.users?.full_name || 'Unknown',
        lastMessage: lastMsg?.content || 'No messages yet',
        lastMessageTime: lastMsg?.created_at || '',
        unreadCount: 0,
      });
    }

    setConversations(conversationList);
    setLoading(false);
  };

  const fetchMessages = async (requestId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id (full_name, role)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequest) return;

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      content: newMessage,
      sender_id: staffId,
      receiver_id: conversations.find((c) => c.requestId === selectedRequest)?.customerId,
      request_id: selectedRequest,
    });

    if (!error) {
      setNewMessage('');
      fetchMessages(selectedRequest);
    }
    setSending(false);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)] bg-white rounded-lg border border-amber-200 shadow-sm overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-amber-200 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-amber-700">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-amber-700">No conversations yet</div>
        ) : (
          <div className="divide-y divide-amber-200">
            {conversations.map((conv) => (
              <button
                key={conv.requestId}
                onClick={() => {
                  setSelectedRequest(conv.requestId);
                  fetchMessages(conv.requestId);
                }}
                className={`w-full text-left p-4 hover:bg-amber-50 transition-colors border-b border-amber-100 ${
                  selectedRequest === conv.requestId ? 'bg-amber-100' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-amber-900 truncate">{conv.customerName}</h3>
                  <span className="text-xs text-amber-700 ml-2 flex-shrink-0">{formatDate(conv.lastMessageTime)}</span>
                </div>
                <p className="text-sm text-amber-700 truncate">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages View */}
      <div className="flex-1 flex flex-col">
        {selectedRequest ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-amber-700">
                  <p>No messages in this conversation. Start the conversation by sending a message.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === staffId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_id === staffId
                          ? 'bg-amber-700 text-white rounded-br-none'
                          : 'bg-amber-100 text-amber-900 rounded-bl-none'
                      }`}
                    >
                      {msg.sender_id !== staffId && <p className="text-xs font-semibold mb-1 opacity-75">Customer</p>}
                      <p className="break-words">{msg.content}</p>
                      <p className="text-xs opacity-75 mt-1">{formatDate(msg.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-amber-200 bg-amber-50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 border-amber-200"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-amber-700 hover:bg-amber-800 px-4"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-amber-700">
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
