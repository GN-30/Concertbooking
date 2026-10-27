-- ====================================================================
-- SwarSetu — Supabase Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create Artists / Users Table
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'vocal', -- vocal, mrudangist, tabla, violinist, flutist, harmonist, veena
    bio TEXT,
    location TEXT DEFAULT 'Chennai, India',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Concert Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concert_title TEXT NOT NULL,
    venue TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by TEXT NOT NULL, -- email or artist UUID
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Troupe Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    invited_user_id TEXT NOT NULL, -- artist id or email
    invited_user_name TEXT,
    role TEXT NOT NULL, -- vocal, mrudangist, tabla, etc.
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    sent_by TEXT NOT NULL, -- email of organizer
    sent_by_name TEXT,
    date_time TIMESTAMP WITH TIME ZONE,
    concert_title TEXT,
    venue TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- invite, accept, reject, reminder
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Open Policies for Public Read & Write
CREATE POLICY "Public read artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Public insert artists" ON public.artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update artists" ON public.artists FOR UPDATE USING (true);

CREATE POLICY "Public read sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Public insert sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sessions" ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Public read invitations" ON public.invitations FOR SELECT USING (true);
CREATE POLICY "Public insert invitations" ON public.invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update invitations" ON public.invitations FOR UPDATE USING (true);

CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notifications" ON public.notifications FOR UPDATE USING (true);

-- 7. Seed Initial Indian Classical Maestros
INSERT INTO public.artists (name, email, username, role, bio)
VALUES
    ('S. Kumar', 'kumar@mail.com', 'skumar', 'vocal', 'Senior Carnatic vocalist renowned for soulful Bhava and Kharaharapriya improvisations.'),
    ('T. Ramesh', 'ramesh@mail.com', 'tramesh', 'mrudangist', 'Veteran Mridangam vidwan with 25+ years accompanying top Carnatic stalwarts.'),
    ('L. Priya', 'priya@mail.com', 'lpriya', 'harmonist', 'Accomplished Harmonium soloist & accompanist specializing in Bhajans & Abhangs.'),
    ('Ustad Zakir Ahmed', 'zakir@mail.com', 'zakir', 'tabla', 'Hindustani Tabla virtuoso celebrated for lightning-fast tihais and crisp dayan bols.'),
    ('Vidushi Gayatri V.', 'gayatri@mail.com', 'gayatri', 'veena', 'Saraswati Veena maestro evoking sublime microtonal shrutis and classical ragas.'),
    ('Pandit Rakesh Venu', 'rakesh@mail.com', 'rakesh', 'flutist', 'Master of the Bansuri flute crafting spiritual alapanas and resonant gamakas.')
ON CONFLICT (email) DO NOTHING;
