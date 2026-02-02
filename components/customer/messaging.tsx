'use client';

import React from "react"

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export function Messaging({ requestId, userId }: { requestId: string; userId: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:request_id=eq.${requestId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${requestId}` }, (payload: any) => {
        setMessages((prev) => {
          if (prev.some(msg => msg.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('messages').insert([
        {
          request_id: requestId,
          sender_id: userId,
          content: newMessage.trim(),
        },
      ]).select().single();

      if (data) {
        setNewMessage('');
        // Optimistically add message or rely on subscription?
        // Since we have a subscription, we might get a duplicate if we add it manually AND look at subscription.
        // But the user complained about lag.
        // Subscription should be fast enough if configured correctly.
        // However, `data` from insert returns the new row if we ask for it.
        // Let's modify insert to select().single() and add it.
        // BUT, if the subscription also fires, we need to dedup.

        // Let's rely on valid subscription with filter first. 
        // Or better: Add it manually, and handle deduplication in the state updater if needed.
        // Simple approach: The subscription gives us the message.
        // If we want immediate feedback, we can add it safely.
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-amber-200 p-6">
      <h3 className="font-semibold text-amber-900 mb-4">Messages</h3>

      {/* Messages Container */}
      <div className="bg-amber-50 rounded p-4 h-64 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-amber-600 py-8">No messages yet. Start a conversation!</p>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender_id === userId
                    ? 'bg-amber-600 text-white rounded-br-none'
                    : 'bg-white border border-amber-200 text-amber-900 rounded-bl-none'
                    }`}
                >
                  <p className="text-sm font-medium mb-1">{msg.sender_id === userId ? 'You' : 'Staff'}</p>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_id === userId ? 'text-amber-100' : 'text-amber-600'}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !newMessage.trim()} className="bg-amber-700 hover:bg-amber-800">
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
