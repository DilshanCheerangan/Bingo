'use client'

import React, { useState } from "react";
import { BingoCard, BingoCardProps } from "./BingoCard";
import { SubmissionModal } from "./SubmissionModal";
import { cn } from "@/lib/utils";

export interface Challenge extends Omit<BingoCardProps, "onClick" | "index"> {
  id: string;
  description: string;
  proof_requirements: string;
  rejectionReason?: string | null;
}

interface BingoBoardProps {
  challenges: Challenge[];
  eventId: string;
  playerId: string;
  isPaused: boolean;
  isFinished: boolean;
  className?: string;
}

export function BingoBoard({ challenges, eventId, playerId, isPaused, isFinished, className }: BingoBoardProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  // Ensure we only have 9 challenges for the 3x3 grid
  const displayChallenges = challenges.slice(0, 9);

  return (
    <>
      <div className={cn("grid grid-cols-3 gap-2 p-2 bg-white/50 rounded-[24px] border border-neutral-100", className)}>
        {displayChallenges.map((challenge, i) => (
          <BingoCard
            key={challenge.id}
            index={i + 1}
            title={challenge.title}
            description={challenge.description}
            icon={challenge.icon}
            status={challenge.status}
            onClick={() => {
              if (challenge.status !== 'verified' && !isPaused && !isFinished) {
                 setSelectedChallenge(challenge)
              }
            }}
          />
        ))}
      </div>

      {selectedChallenge && (
        <SubmissionModal
          challenge={selectedChallenge}
          eventId={eventId}
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </>
  );
}
