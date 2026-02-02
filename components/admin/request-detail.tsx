'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle } from 'lucide-react';

interface AdminRequestDetailProps {
  requestId: string;
  initialRequest: any;
}

export function AdminRequestDetail({ requestId, initialRequest }: AdminRequestDetailProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [request, setRequest] = useState(initialRequest);
  const [items, setItems] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [statusNotes, setStatusNotes] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: itemsData } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('request_id', requestId);

      if (itemsData) setItems(itemsData);

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (messagesData) setMessages(messagesData);
    };

    fetchDetails();

    const channel = supabase
      .channel(`admin-request:id=eq.${requestId}`)
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

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error: statusError } = await supabase
        .from('cleaning_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (!statusError) {
        await supabase.from('status_history').insert([
          {
            request_id: requestId,
            new_status: newStatus,
            notes: statusNotes,
          },
        ]);

        setRequest({ ...request, status: newStatus });
        setStatusNotes('');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase.from('messages').insert([
        {
          request_id: requestId,
          sender_id: user.id,
          content: newMessage.trim(),
        },
      ]).select().single();

      if (data) {
        setNewMessage('');
        setMessages((prev) => {
          if (prev.some(msg => msg.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      ready_for_pickup: 'bg-green-100 text-green-800',
      picked_up: 'bg-gray-100 text-gray-800',
      completed: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Request Overview */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-amber-900">#{requestId.slice(0, 8).toUpperCase()}</h2>
            <p className="text-sm text-amber-600">Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</p>
          </div>
          <Badge className={getStatusColor(request.status)}>{formatStatus(request.status)}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-amber-600 uppercase">Items</p>
            <p className="text-lg font-semibold text-amber-900">{items.length}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Cost</p>
            <p className="text-lg font-semibold text-amber-900">₦{request.total_cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Pickup Date</p>
            <p className="text-lg font-semibold text-amber-900">{new Date(request.scheduled_pickup).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Payment</p>
            <p className="text-lg font-semibold text-amber-900">On Pickup</p>
          </div>
        </div>
      </div>

      {/* Clothing Items */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-900 mb-4">Clothing Items</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-amber-200 rounded p-3 bg-amber-50">
              <div className="flex justify-between mb-2">
                <p className="font-medium text-amber-900">{item.item_type}</p>
                <p className="text-amber-700">
                  {item.quantity} x ₦{item.estimated_cost.toLocaleString()}
                </p>
              </div>
              {item.special_instructions && (
                <p className="text-sm text-amber-700 italic">Instructions: {item.special_instructions}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-900 mb-4">Update Status</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">New Status</label>
            <Select value={request.status} onValueChange={updateStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Notes (Optional)</label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add notes about this status update"
              className="w-full px-3 py-2 border border-amber-300 rounded bg-amber-50 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-900 mb-4">Messages</h3>

        <div className="bg-amber-50 rounded p-4 h-64 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-amber-600 py-8">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className={`flex-1 px-3 py-2 rounded ${msg.sender_id !== request.user_id ? 'bg-amber-600 text-white' : 'bg-white border border-amber-200'}`}>
                  <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_id === request.user_id ? 'Customer' : 'Staff'}</p>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-50">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="space-y-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message to the customer..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !newMessage.trim()} className="w-full bg-amber-700 hover:bg-amber-800">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
