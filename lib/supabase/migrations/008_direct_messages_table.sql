-- Migration: Direct Messages Table
-- Sistema de mensagens diretas (DM)

-- Direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (sender_id != receiver_id) -- Não pode enviar mensagem para si mesmo
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dm_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver_id ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created_at ON direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_is_read ON direct_messages(is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read messages they sent or received
CREATE POLICY "Users can read own messages"
  ON direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can send messages
CREATE POLICY "Users can send messages"
  ON direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update read status of messages they received
CREATE POLICY "Users can mark messages as read"
  ON direct_messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON direct_messages FOR DELETE
  USING (auth.uid() = sender_id);

