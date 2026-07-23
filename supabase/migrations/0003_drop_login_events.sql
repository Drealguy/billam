-- ============================================================
-- Rolls back login_events (added in 0002_user_moderation.sql).
-- Decided against tracking this at all — same privacy reasoning as
-- not exposing a customer's client list to admins. The status check
-- at login (blocking suspended/banned/deleted accounts) stays; only
-- the login-event logging is removed.
-- ============================================================

drop table if exists public.login_events;
