'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
}

export function UsersTable() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-blue-100 text-blue-800',
      staff: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'customer' ? 'staff' : currentRole === 'staff' ? 'admin' : 'customer';

    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-amber-700">Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-amber-50 border-b border-amber-200">
          <TableRow>
            <TableHead className="text-amber-900">Name</TableHead>
            <TableHead className="text-amber-900">Email</TableHead>
            <TableHead className="text-amber-900">Phone</TableHead>
            <TableHead className="text-amber-900">Role</TableHead>
            <TableHead className="text-amber-900">Joined</TableHead>
            <TableHead className="text-amber-900 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-b border-amber-100 hover:bg-amber-50">
              <TableCell className="font-medium text-amber-900">{user.full_name}</TableCell>
              <TableCell className="text-amber-900">{user.email}</TableCell>
              <TableCell className="text-amber-900">{user.phone}</TableCell>
              <TableCell>
                <Badge className={getRoleColor(user.role)}>
                  {user.role.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-amber-600">
                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => toggleRole(user.id, user.role)}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Change Role
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className="text-center py-12 text-amber-700">No users found</div>
      )}
    </div>
  );
}
