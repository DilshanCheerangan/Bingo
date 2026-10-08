export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          active: boolean | null
          description: string
          event_id: string | null
          icon: string
          id: string
          proof_requirements: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean | null
          description: string
          event_id?: string | null
          icon: string
          id?: string
          proof_requirements: string
          sort_order: number
          title: string
        }
        Update: {
          active?: boolean | null
          description?: string
          event_id?: string | null
          icon?: string
          id?: string
          proof_requirements?: string
          sort_order?: number
          title?: string
        }
      }
      events: {
        Row: {
          created_at: string | null
          ended_at: string | null
          event_code: string
          id: string
          name: string
          started_at: string | null
          status: 'draft' | 'live' | 'paused' | 'finished'
          winner_player_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          event_code: string
          id?: string
          name: string
          started_at?: string | null
          status?: 'draft' | 'live' | 'paused' | 'finished'
          winner_player_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          event_code?: string
          id?: string
          name?: string
          started_at?: string | null
          status?: 'draft' | 'live' | 'paused' | 'finished'
          winner_player_id?: string | null
        }
      }
      players: {
        Row: {
          auth_user_id: string | null
          event_id: string | null
          id: string
          joined_at: string | null
          lc_name: string
          name: string
          role: 'player' | 'organizer'
        }
        Insert: {
          auth_user_id?: string | null
          event_id?: string | null
          id?: string
          joined_at?: string | null
          lc_name: string
          name: string
          role?: 'player' | 'organizer'
        }
        Update: {
          auth_user_id?: string | null
          event_id?: string | null
          id?: string
          joined_at?: string | null
          lc_name?: string
          name?: string
          role?: 'player' | 'organizer'
        }
      }
      submissions: {
        Row: {
          challenge_id: string | null
          event_id: string | null
          id: string
          player_id: string | null
          proof_path: string
          proof_type: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          event_id?: string | null
          id?: string
          player_id?: string | null
          proof_path: string
          proof_type: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          event_id?: string | null
          id?: string
          player_id?: string | null
          proof_path?: string
          proof_type?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string | null
        }
      }
      winner_events: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          detected_at: string | null
          event_id: string | null
          id: string
          player_id: string | null
          verified_count: number
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          detected_at?: string | null
          event_id?: string | null
          id?: string
          player_id?: string | null
          verified_count: number
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          detected_at?: string | null
          event_id?: string | null
          id?: string
          player_id?: string | null
          verified_count?: number
        }
      }
    }
  }
}
