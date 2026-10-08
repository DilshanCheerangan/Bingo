'use client'

import React, { useState, useEffect } from 'react'
import { BingoCard } from '@/components/bingo/BingoCard'
import { WinnerModal } from '@/components/bingo/WinnerModal'
import { ProgressCard } from '@/components/bingo/ProgressCard'

const CHALLENGES = [
  { id: '1', title: "Make Us Laugh", icon: "😂", description: "Send something funny in the group that gets at least 3 reactions." },
  { id: '2', title: "Funny Sticker", icon: "😂", description: "Send a funny sticker of yourself." },
  { id: '3', title: "Share Your Centre Moment", icon: "", description: "Share a favourite memory or moment from KP in the group." },
  { id: '4', title: "Text a Stranger", icon: "👋", description: "Text a volunteer from ANOTHER LC, NOT your classmate." },
  { id: '5', title: "Movie Dialogue", icon: "🎤", description: "Send a voice note saying any movie dialogue in the centre group." },
  { id: '6', title: "Unpopular Food Combo", icon: "🍕", description: "Share an unpopular food combination you like." },
  { id: '7', title: "Childhood Photo", icon: "👶", description: "Share a cute photo of yourself as a child." },
  { id: '8', title: "Unpopular Opinion", icon: "🔥", description: "Share one of your unpopular opinions." },
  { id: '9', title: "Sing a Song", icon: "🎵", description: "Sing the chorus of your favourite song in the centre group." },
]

export default function Home() {
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set())
  const [hasMounted, setHasMounted] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('bingoVerified')
    if (saved) {
      try {
        setVerifiedIds(new Set(JSON.parse(saved)))
      } catch(e) {}
    }
    setHasMounted(true)
  }, [])

  // Save to local storage
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('bingoVerified', JSON.stringify(Array.from(verifiedIds)))
    }
  }, [verifiedIds, hasMounted])

  const toggleVerified = (id: string) => {
    setVerifiedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const resetGame = () => {
    if (window.confirm("Are you sure you want to reset your Bingo card?")) {
      setVerifiedIds(new Set())
      localStorage.removeItem('bingoVerified')
    }
  }

  if (!hasMounted) return null // Prevent hydration mismatch

  const verifiedCount = verifiedIds.size
  const isWinner = verifiedCount >= 6

  return (
    <main className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 tracking-tight">COMMUNITY BINGO</h1>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </div>
        </div>
        <button 
          onClick={resetGame}
          className="text-xs font-bold text-gray-500 hover:text-red-500 bg-gray-100 px-3 py-1.5 rounded-full"
        >
          RESET
        </button>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <ProgressCard completed={verifiedCount} total={6} />
        
        <div className="grid grid-cols-3 gap-2 p-2 bg-white/50 rounded-[24px] border border-neutral-100 shadow-sm">
          {CHALLENGES.map((challenge, i) => {
            const isVerified = verifiedIds.has(challenge.id)
            return (
              <BingoCard
                key={challenge.id}
                index={i + 1}
                title={challenge.title}
                description={challenge.description}
                icon={challenge.icon}
                status={isVerified ? 'verified' : 'available'}
                onClick={() => toggleVerified(challenge.id)}
              />
            )
          })}
        </div>
      </div>

      {isWinner && (
        <WinnerModal 
          show={true}
        />
      )}
    </main>
  )
}
