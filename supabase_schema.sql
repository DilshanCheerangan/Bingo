-- Supabase Schema for Community Bingo

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for Event Status
CREATE TYPE event_status AS ENUM ('draft', 'live', 'paused', 'finished');

-- Enum for Player Role
CREATE TYPE player_role AS ENUM ('player', 'organizer');

-- Enum for Submission Status
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Events Table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    event_code TEXT UNIQUE NOT NULL,
    status event_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    winner_player_id UUID -- References players(id) later
);

-- Players Table
CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    lc_name TEXT NOT NULL,
    role player_role NOT NULL DEFAULT 'player',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE
);

-- Add foreign key constraint for winner to events table
ALTER TABLE public.events
ADD CONSTRAINT fk_events_winner
FOREIGN KEY (winner_player_id) REFERENCES public.players(id)
ON DELETE SET NULL;

-- Challenges Table
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    proof_requirements TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    UNIQUE(event_id, sort_order)
);

-- Submissions Table
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    proof_path TEXT NOT NULL,
    proof_type TEXT NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.players(id) ON DELETE SET NULL,
    UNIQUE(event_id, player_id, challenge_id, status) -- Actually we just want one approved per challenge, will enforce with trigger/partial index
);

-- Partial index to ensure only one approved submission per challenge per player
CREATE UNIQUE INDEX one_approved_submission_per_challenge 
ON public.submissions (event_id, player_id, challenge_id) 
WHERE status = 'approved';

-- Winner Events Table
CREATE TABLE public.winner_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    verified_count INTEGER NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES public.players(id) ON DELETE SET NULL
);

-- Function to atomically claim winner
CREATE OR REPLACE FUNCTION claim_event_winner(p_event_id UUID, p_player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_approved_count INTEGER;
    v_winner_exists BOOLEAN;
BEGIN
    -- Lock the event row for update
    PERFORM id FROM public.events WHERE id = p_event_id FOR UPDATE;

    -- Check if winner already exists
    SELECT EXISTS (
        SELECT 1 FROM public.events WHERE id = p_event_id AND winner_player_id IS NOT NULL
    ) INTO v_winner_exists;

    IF v_winner_exists THEN
        RETURN FALSE;
    END IF;

    -- Count approved challenges
    SELECT COUNT(*) INTO v_approved_count
    FROM public.submissions
    WHERE event_id = p_event_id AND player_id = p_player_id AND status = 'approved';

    IF v_approved_count >= 6 THEN
        -- Assign winner
        UPDATE public.events
        SET winner_player_id = p_player_id, status = 'finished'
        WHERE id = p_event_id;

        -- Record winner event
        INSERT INTO public.winner_events (event_id, player_id, verified_count)
        VALUES (p_event_id, p_player_id, v_approved_count);

        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- RLS Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_events ENABLE ROW LEVEL SECURITY;

-- Events Policies (Anyone can read, organizers can manage)
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizers can insert events" ON public.events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Organizers can update events" ON public.events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);

-- Players Policies
CREATE POLICY "Players can view themselves and public data" ON public.players FOR SELECT USING (true);
CREATE POLICY "Users can create their own player profile" ON public.players FOR INSERT WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "Players can update their own profile" ON public.players FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "Organizers can update any player" ON public.players FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);

-- Challenges Policies
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Organizers can manage challenges" ON public.challenges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);

-- Submissions Policies
CREATE POLICY "Players can view their own submissions" ON public.submissions FOR SELECT USING (
    player_id IN (SELECT id FROM public.players WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Players can create their own submissions" ON public.submissions FOR INSERT WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Organizers can update submissions" ON public.submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);

-- Winner Events Policies
CREATE POLICY "Anyone can view winner events" ON public.winner_events FOR SELECT USING (true);
CREATE POLICY "Organizers can manage winner events" ON public.winner_events FOR ALL USING (
    EXISTS (SELECT 1 FROM public.players WHERE auth_user_id = auth.uid() AND role = 'organizer')
);

-- Set up realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.winner_events;
