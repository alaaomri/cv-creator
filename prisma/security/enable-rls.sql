-- =============================================================================
-- CV Studio Cloud — Row Level Security (RLS) lockdown
-- =============================================================================
-- Fixes the Supabase Security Advisor "RLS Disabled in Public" errors for:
--   public.users, public.cvs, public.activity_logs,
--   public.export_metrics, public.health_reports
--
-- Context:
--   This application NEVER uses Supabase PostgREST or the anon/authenticated
--   client keys. All database access goes through the Express backend using
--   Prisma with the owner "postgres" role, which BYPASSES RLS.
--
--   Therefore we enable RLS with NO permissive policies. This blocks every
--   anon/authenticated request coming through the auto-generated REST API,
--   while the trusted backend (table owner) continues to work unchanged.
--
-- Safe to run multiple times (idempotent).
-- Run this in the Supabase SQL Editor (or `psql`) against your project.
-- =============================================================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports  ENABLE ROW LEVEL SECURITY;

-- Optional hardening: FORCE RLS so that even the table owner is subject to
-- policies. Leave this COMMENTED OUT — Prisma connects as the owner and relies
-- on the default owner-bypass. Only enable if you add explicit backend policies.
-- ALTER TABLE public.users          FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.cvs            FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.activity_logs  FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.export_metrics FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.health_reports FORCE ROW LEVEL SECURITY;

-- Belt-and-suspenders: explicitly revoke direct table access from the PostgREST
-- API roles so the tables cannot be reached even if RLS is later disabled.
REVOKE ALL ON public.users          FROM anon, authenticated;
REVOKE ALL ON public.cvs            FROM anon, authenticated;
REVOKE ALL ON public.activity_logs  FROM anon, authenticated;
REVOKE ALL ON public.export_metrics FROM anon, authenticated;
REVOKE ALL ON public.health_reports FROM anon, authenticated;
