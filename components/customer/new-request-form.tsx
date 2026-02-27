'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

interface ClothingItem {
  id: string;
  type: string;
  quantity: number;
  instructions: string;
  cost_per_unit: number;
}

export function NewRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [items, setItems] = useState<ClothingItem[]>([
    { id: '1', type: '', quantity: 1, instructions: '', cost_per_unit: 0 },
  ]);
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; base_price: number }[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('item_categories').select('*').order('name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const addItem = () => {
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      type: '',
      quantity: 1,
      instructions: '',
      cost_per_unit: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
            ...item,
            [field]: field === 'quantity' || field === 'cost_per_unit' ? Number(value) : value,
          }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.cost_per_unit, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!address.trim()) {
        throw new Error('Please enter your address');
      }
      if (!pickupDate) {
        throw new Error('Please select a pickup date');
      }
      if (items.some((item) => !item.type.trim())) {
        throw new Error('Please fill in all item types');
      }

      const totalCost = calculateTotal();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      // 1. Create address record first (since cleaning_requests needs address_id)
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: userId,
            street_address: address, // Map 'address' state to 'street_address' column
            city: 'Lagos', // Defaulting for now as the form only has one address field
            state: 'Lagos',
            postal_code: '000000',
            latitude: 0,
            longitude: 0,
            is_default: false,
          },
        ])
        .select()
        .single();

      if (addressError) throw new Error(`Address error: ${addressError.message}`);

      // 2. Create cleaning request
      const { data: requestData, error: requestError } = await supabase
        .from('cleaning_requests')
        .insert([
          {
            user_id: userId,
            address_id: addressData.id, // Use the ID from the created address
            status: 'pending',
            total_cost: totalCost,
            total_items: totalItems,
            scheduled_pickup: pickupDate,
            notes: '',
          },
        ])
        .select()
        .single();

      if (requestError) throw new Error(`Request error: ${requestError.message}`);

      // 3. Insert clothing items
      const clothingItems = items.map((item) => ({
        request_id: requestData.id,
        item_type: item.type,
        quantity: item.quantity,
        special_instructions: item.instructions,
        estimated_cost: item.cost_per_unit, // Schema uses 'estimated_cost', not 'cost_per_unit'
      }));

      const { error: itemsError } = await supabase.from('clothing_items').insert(clothingItems);

      if (itemsError) throw new Error(`Items error: ${itemsError.message}`);

      router.push(`/dashboard/requests/${requestData.id}?success=true`);
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-amber-200 p-6">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Address Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-amber-900 mb-3">Pickup Address</h3>
        <label className="block text-sm font-medium text-amber-900 mb-1">Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder="Enter your full address for pickup"
          className="w-full px-3 py-2 border border-amber-300 rounded bg-amber-50 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
          rows={3}
        />
      </div>

      {/* Pickup Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-amber-900 mb-1">Pickup Date</label>
        <Input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Clothing Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-amber-900 mb-3">Clothing Items</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-amber-200 rounded p-4 bg-amber-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-amber-900 mb-1">Item Type</label>
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const selectedCat = categories.find(c => c.name === e.target.value);
                      if (selectedCat) {
                        updateItem(item.id, 'type', selectedCat.name);
                        updateItem(item.id, 'cost_per_unit', selectedCat.base_price);
                      } else {
                        updateItem(item.id, 'type', '');
                        updateItem(item.id, 'cost_per_unit', 0);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-amber-300 rounded-md bg-white text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm h-10"
                  >
                    <option value="" disabled>Select item type</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-900 mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-900 mb-1">Unit Cost (₦)</label>
                  <div className="w-full px-3 py-2 text-amber-900 font-semibold flex items-center h-10">
                    {item.cost_per_unit > 0 ? `₦${item.cost_per_unit.toLocaleString()}` : '—'}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded disabled:opacity-50"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-amber-900 mb-1">Special Instructions</label>
                <textarea
                  value={item.instructions}
                  onChange={(e) => updateItem(item.id, 'instructions', e.target.value)}
                  placeholder="Any special care instructions"
                  className="w-full px-3 py-2 border border-amber-300 rounded bg-white text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-medium"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Summary */}
      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-amber-900 font-medium">Total Items:</p>
          <p className="text-amber-900 font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p className="text-amber-900 font-semibold">Total Cost:</p>
          <p className="text-amber-900 font-bold">₦{calculateTotal().toLocaleString()}</p>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800">
        {loading ? 'Creating Request...' : 'Create Cleaning Request'}
      </Button>
    </form>
  );
}
