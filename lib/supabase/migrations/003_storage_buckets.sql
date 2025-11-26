-- Migration: Storage Buckets
-- Execute este SQL no Supabase SQL Editor

-- Cria bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Cria bucket para posts (imagens e vídeos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Cria bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Cria bucket para outros arquivos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  true,
  104857600, -- 100MB
  NULL -- Aceita qualquer tipo de arquivo
)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para bucket 'avatars'
-- Qualquer um pode ler avatares (público)
CREATE POLICY "Avatares são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Usuários autenticados podem fazer upload de seus próprios avatares
CREATE POLICY "Usuários podem fazer upload de avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem atualizar seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem deletar seus próprios avatares
CREATE POLICY "Usuários podem deletar seus próprios avatares"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas RLS para bucket 'posts'
-- Qualquer um pode ler posts (público)
CREATE POLICY "Posts são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

-- Usuários autenticados podem fazer upload de posts
CREATE POLICY "Usuários podem fazer upload de posts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'posts' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem atualizar seus próprios posts
CREATE POLICY "Usuários podem atualizar seus próprios posts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'posts' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'posts' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem deletar seus próprios posts
CREATE POLICY "Usuários podem deletar seus próprios posts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'posts' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas RLS para bucket 'documents'
-- Qualquer um pode ler documentos (público)
CREATE POLICY "Documentos são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Usuários autenticados podem fazer upload de documentos
CREATE POLICY "Usuários podem fazer upload de documentos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem atualizar seus próprios documentos
CREATE POLICY "Usuários podem atualizar seus próprios documentos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem deletar seus próprios documentos
CREATE POLICY "Usuários podem deletar seus próprios documentos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas RLS para bucket 'files'
-- Qualquer um pode ler arquivos (público)
CREATE POLICY "Arquivos são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'files');

-- Usuários autenticados podem fazer upload de arquivos
CREATE POLICY "Usuários podem fazer upload de arquivos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem atualizar seus próprios arquivos
CREATE POLICY "Usuários podem atualizar seus próprios arquivos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuários podem deletar seus próprios arquivos
CREATE POLICY "Usuários podem deletar seus próprios arquivos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

