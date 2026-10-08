# Community Bingo 🎯

A real-time community engagement Bingo game built with Next.js and Supabase.

## Features

- **Mobile-First UI**: Fast, responsive, and native-feeling interface for players.
- **Real-Time Progress**: Players see verifications and winner announcements instantly via Supabase Realtime.
- **Atomic Winner Detection**: Race conditions are prevented at the database level to ensure exactly one winner.
- **Organizer Dashboard**: Rapid approval/rejection system for event organizers.
- **Role-Based Access**: Supabase RLS enforces secure access to data.

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Supabase CLI (`npm install -g supabase`)
- A Supabase account / project

### 2. Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

You can run the provided `supabase_schema.sql` file in your Supabase SQL Editor.
This will:
1. Create all necessary tables (`events`, `players`, `challenges`, `submissions`, `winner_events`)
2. Set up Enums for statuses
3. Create the `claim_event_winner` atomic RPC function
4. Set up Row Level Security (RLS) policies
5. Enable Realtime on critical tables

### 4. Storage Setup

Create a new storage bucket in your Supabase project named `bingo-proofs`.
Enable authenticated access and set up the necessary RLS policies for storage:
- Insert: Allow authenticated users to upload files to their player ID folder.
- Select: Allow users to see their own files, and organizers to see all files.

### 5. Seed Data

To seed the initial event and 9 challenges, and create an organizer account:

```bash
node scripts/seed.js
```

The default organizer login will be `admin@bingo.local` with password `password123`.

### 6. Running the App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to start playing.
Visit `http://localhost:3000/admin` to access the organizer dashboard.
