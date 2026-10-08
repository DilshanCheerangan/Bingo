import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import React from "react";

export type BingoStatus = "available" | "pending" | "verified" | "rejected";

export interface BingoCardProps {
  index: number;
  title: string;
  description?: string;
  icon: string | React.ReactNode;
  status: BingoStatus;
  onClick?: () => void;
  className?: string;
}

export function BingoCard({ index, title, description, icon, status, onClick, className }: BingoCardProps) {
  const bgColors: Record<number, string> = {
    1: "bg-[#FDF2B5]",
    2: "bg-[#E5F5CC]",
    3: "bg-[#DFEBF7]",
    4: "bg-[#EBE2F7]",
    5: "bg-[#FCEBCE]",
    6: "bg-[#FCE2EB]",
    7: "bg-[#D7F5EE]",
    8: "bg-[#FCF5CC]",
    9: "bg-[#E3E8ED]",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-3 sm:p-4 rounded-[16px] transition-all duration-200 active:scale-[0.98] border-2 border-transparent hover:border-black/10 overflow-hidden text-center",
        bgColors[index] || "bg-white",
        className
      )}
    >
      {/* Top Left Number Circle */}
      <div className="absolute top-2 left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center font-black text-sm text-[#1A1A1A] shadow-sm">
        {index}
      </div>
      
      {/* Icon and Title Container */}
      <div className="mt-6 flex flex-col items-center justify-center gap-1 w-full min-h-[60px]">
        {icon && (
          <div className="text-3xl flex-shrink-0">
            {typeof icon === "string" ? <span>{icon}</span> : icon}
          </div>
        )}
        <div className="text-[14px] sm:text-[16px] font-black text-[#1A1A1A] leading-tight">
          {title}
        </div>
      </div>
      
      {/* Description Container */}
      {description && (
        <div className="mt-2 text-[10px] sm:text-[11px] font-bold text-[#1A1A1A]/80 leading-snug px-1">
          {description}
        </div>
      )}

      {/* Status Overlays */}
      {status === "verified" && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px] z-10 rounded-[14px]">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-4 h-4" /> VERIFIED
          </div>
        </div>
      )}
      
      {status === "pending" && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px] z-10 rounded-[14px]">
          <div className="bg-amber-500 text-white px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1 text-xs">
            <Clock className="w-4 h-4" /> PENDING
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[1px] border-2 border-red-500 z-10 rounded-[14px]">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1 text-xs">
            <XCircle className="w-4 h-4" /> REJECTED
          </div>
        </div>
      )}
    </button>
  );
}
