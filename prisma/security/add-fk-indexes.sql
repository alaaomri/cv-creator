-- =============================================================================
-- CV Studio Cloud — Foreign key covering indexes
-- =============================================================================
-- Fixes the Supabase Performance Advisor "Unindexed foreign keys" suggestions:
--   public.cvs.userId            -> public.users(id)
--   public.activity_logs.userId  -> public.users(id)
--
-- A covering index on each FK column speeds up joins and, importantly, avoids
-- full-table scans when the parent row is updated/deleted (cascade / set null).
--
-- Safe to run multiple times (idempotent).
-- Run in the Supabase SQL Editor (or `psql`) against your project.
-- =============================================================================

CREATE INDEX IF NOT EXISTS "cvs_userId_idx"
  ON public.cvs ("userId");

CREATE INDEX IF NOT EXISTS "activity_logs_userId_idx"
  ON public.activity_logs ("userId");
