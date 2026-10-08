"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, UploadCloud, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Challenge } from "./BingoBoard";

interface SubmissionModalProps {
  challenge: Challenge | null;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (file: File) => void;
}

export function SubmissionModal({ challenge, eventId, isOpen, onClose, onUpload }: SubmissionModalProps) {
  if (!challenge) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 sm:rounded-[24px] rounded-t-[24px] bottom-0 top-auto translate-y-0 sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] bg-[#FAFAF8] shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-[48%] data-[state=open]:slide-in-from-bottom-[48%] sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%] outline-none">
          
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-sm border border-neutral-100 text-4xl">
              {typeof challenge.icon === "string" ? challenge.icon : challenge.icon}
            </div>
            <div>
              <DialogPrimitive.Title className="text-xl font-black text-neutral-900 leading-tight">
                {challenge.title}
              </DialogPrimitive.Title>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 rounded-[16px] bg-white p-4 border border-neutral-200 shadow-sm text-center">
            <h4 className="text-sm font-black text-neutral-900 mb-2">Instructions</h4>
            <p className="text-[15px] font-medium text-neutral-700 whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          {/* Status Specific Content */}
          {challenge.status === "rejected" && (
            <div className="mt-2 rounded-[16px] bg-red-50 p-4 border border-red-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-red-900">Submission Rejected</h4>
                <p className="text-sm text-red-700 mt-1">
                  We couldn't verify your submission. Please make sure the photo clearly shows the required activity and try again.
                </p>
              </div>
            </div>
          )}
          
          {challenge.status === "pending" && (
            <div className="mt-2 rounded-[16px] bg-amber-50 p-4 border border-amber-100 text-center">
              <h4 className="text-sm font-bold text-amber-900">Under Review</h4>
              <p className="text-sm text-amber-700 mt-1">
                Your submission is currently being reviewed. Please check back later.
              </p>
            </div>
          )}

          {challenge.status === "verified" && (
            <div className="mt-2 rounded-[16px] bg-green-50 p-4 border border-green-100 text-center">
              <h4 className="text-sm font-bold text-green-900">Verified! 🎉</h4>
              <p className="text-sm text-green-700 mt-1">
                You've successfully completed this challenge.
              </p>
            </div>
          )}

          {/* Action Area */}
          <div className="mt-6 flex flex-col gap-3">
            {(challenge.status === "available" || challenge.status === "rejected") && (
              <form action={async (formData) => {
                const submitBtn = document.getElementById(`submit-btn-${challenge.id}`) as HTMLButtonElement;
                const errorDiv = document.getElementById(`error-${challenge.id}`);
                if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'UPLOADING...'; }
                if (errorDiv) { errorDiv.innerText = ''; }
                
                try {
                  const { submitProof } = await import('@/actions/submissions')
                  const res = await submitProof(formData)
                  if (res?.error) {
                    if (errorDiv) { errorDiv.innerText = res.error; }
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'SUBMIT PROOF'; }
                  } else {
                    onClose()
                  }
                } catch (e) {
                   if (errorDiv) { errorDiv.innerText = 'Network error during upload.'; }
                   if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'SUBMIT PROOF'; }
                }
              }} className="w-full flex flex-col gap-3">
                <input type="hidden" name="challengeId" value={challenge.id} />
                <input type="hidden" name="eventId" value={eventId} />
                
                <div id={`error-${challenge.id}`} className="text-red-500 text-sm font-bold text-center"></div>

                <input 
                  type="file" 
                  name="file"
                  id={`file-${challenge.id}`}
                  accept="image/*,video/*,audio/*"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer border border-gray-200 rounded-xl bg-white"
                />
                
                <button 
                  id={`submit-btn-${challenge.id}`}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white font-bold py-4 px-6 rounded-[16px] transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-5 h-5" />
                  SUBMIT PROOF
                </button>
              </form>
            )}
            
            <DialogPrimitive.Close asChild>
              <button className="w-full py-4 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
                CLOSE
              </button>
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 bg-white text-neutral-400 hover:text-neutral-900 shadow-sm border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
