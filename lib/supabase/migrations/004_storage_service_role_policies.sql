-- Migration: Storage Service Role Policies
-- Adiciona políticas que permitem service role fazer upload durante signup
-- Execute este SQL no Supabase SQL Editor

-- Política para service role fazer upload de avatares durante signup
CREATE POLICY "Service role pode fazer upload de avatares durante signup"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'service_role'
  );

-- Política para service role atualizar avatares
CREATE POLICY "Service role pode atualizar avatares"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'service_role'
  );

-- Política para service role deletar avatares
CREATE POLICY "Service role pode deletar avatares"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'service_role'
  );

-- Política para service role fazer upload de posts
CREATE POLICY "Service role pode fazer upload de posts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'posts' AND
    auth.role() = 'service_role'
  );

-- Política para service role atualizar posts
CREATE POLICY "Service role pode atualizar posts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'posts' AND
    auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'posts' AND
    auth.role() = 'service_role'
  );

-- Política para service role deletar posts
CREATE POLICY "Service role pode deletar posts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'posts' AND
    auth.role() = 'service_role'
  );

-- Política para service role fazer upload de documentos
CREATE POLICY "Service role pode fazer upload de documentos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'service_role'
  );

-- Política para service role atualizar documentos
CREATE POLICY "Service role pode atualizar documentos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'service_role'
  );

-- Política para service role deletar documentos
CREATE POLICY "Service role pode deletar documentos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'service_role'
  );

-- Política para service role fazer upload de arquivos
CREATE POLICY "Service role pode fazer upload de arquivos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'files' AND
    auth.role() = 'service_role'
  );

-- Política para service role atualizar arquivos
CREATE POLICY "Service role pode atualizar arquivos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'files' AND
    auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'files' AND
    auth.role() = 'service_role'
  );

-- Política para service role deletar arquivos
CREATE POLICY "Service role pode deletar arquivos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'files' AND
    auth.role() = 'service_role'
  );

