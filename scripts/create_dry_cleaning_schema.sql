-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleaning requests
CREATE TABLE IF NOT EXISTS cleaning_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'pickup_in_progress', 'processing', 'ready', 'delivered', 'cancelled')),
  scheduled_pickup TIMESTAMP WITH TIME ZONE,
  total_items INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Clothing items in requests
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES cleaning_requests(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  special_instructions TEXT,
  estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time messages between customers and staff
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES cleaning_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'status_update')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status history for tracking request changes
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES cleaning_requests(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT 
  USING (auth.uid() = auth_id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT 
  USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE 
  USING (auth.uid() = auth_id);

-- RLS Policies for addresses table
CREATE POLICY "Users can view their own addresses" ON addresses FOR SELECT 
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can create their own addresses" ON addresses FOR INSERT 
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can update their own addresses" ON addresses FOR UPDATE 
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can delete their own addresses" ON addresses FOR DELETE 
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for cleaning_requests table
CREATE POLICY "Customers can view their own requests" ON cleaning_requests FOR SELECT 
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Admins can view all requests" ON cleaning_requests FOR SELECT 
  USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND (role = 'admin' OR role = 'staff')));
CREATE POLICY "Customers can create their own requests" ON cleaning_requests FOR INSERT 
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Admins can update request status" ON cleaning_requests FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND (role = 'admin' OR role = 'staff')));
CREATE POLICY "Customers can update their own pending requests" ON cleaning_requests FOR UPDATE 
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND status = 'pending');

-- RLS Policies for clothing_items table
CREATE POLICY "Users can view items in their requests" ON clothing_items FOR SELECT 
  USING (request_id IN (SELECT id FROM cleaning_requests WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR 
         EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND (role = 'admin' OR role = 'staff')));
CREATE POLICY "Users can create items in their requests" ON clothing_items FOR INSERT 
  WITH CHECK (request_id IN (SELECT id FROM cleaning_requests WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())));

-- RLS Policies for messages table
CREATE POLICY "Users can view messages for their requests" ON messages FOR SELECT 
  USING (request_id IN (SELECT id FROM cleaning_requests WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
         sender_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
         EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND (role = 'admin' OR role = 'staff')));
CREATE POLICY "Users can send messages in their requests" ON messages FOR INSERT 
  WITH CHECK (sender_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for status_history table
CREATE POLICY "Users can view history for their requests" ON status_history FOR SELECT 
  USING (request_id IN (SELECT id FROM cleaning_requests WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
         EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND (role = 'admin' OR role = 'staff')));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_user_id ON cleaning_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_status ON cleaning_requests(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_created_at ON cleaning_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_clothing_items_request_id ON clothing_items(request_id);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON status_history(request_id);
