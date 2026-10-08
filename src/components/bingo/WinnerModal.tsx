'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Trophy, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface WinnerModalProps {
  show: boolean
  isFirst: boolean
}

export function WinnerModal({ show }: WinnerModalProps) {
  const [open, setOpen] = useState(show)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white p-6 rounded-[24px] shadow-xl z-50 flex flex-col items-center text-center outline-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-500 shadow-inner">
              <Trophy size={40} />
            </div>
            <Dialog.Title className="text-2xl font-black text-gray-900 mb-2">
              BINGO! YOU DID IT!
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6 font-medium leading-relaxed">
              You completed 6 challenges! 
              <br/><br/>
              <span className="font-bold text-gray-900">Next Step:</span><br/>
              Close this window, take a screenshot of your beautiful green Bingo board, and send it to the organizer on WhatsApp!
            </Dialog.Description>
          </motion.div>

          <div className="flex flex-col gap-3 w-full">
            <a
              href="whatsapp://send?text=I%20just%20completed%20my%20BINGO%20board!%20%F0%9F%8E%89"
              className="w-full bg-[#25D366] hover:bg-[#22bf5b] text-white flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-colors shadow-sm"
            >
              <Share2 size={20} />
              SHARE ON WHATSAPP
            </a>
            
            <button
              onClick={() => setOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-colors"
            >
              BACK TO BOARD
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
