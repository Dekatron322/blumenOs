"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { LiaTimesSolid } from "react-icons/lia"
import { ButtonModule } from "components/ui/Button/Button"

interface SendReminderModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (message: string) => void
}

const SendReminderModal: React.FC<SendReminderModalProps> = ({ isOpen, onRequestClose, onConfirm }) => {
  const [message, setMessage] = useState("")

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(message)
    setMessage("")
    onRequestClose()
  }

  const handleCancel = () => {
    setMessage("")
    onRequestClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="modal-style rounded-md shadow-md sm:w-[620px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between border-b px-4 pt-4">
          <h2 className="mb-4 text-lg font-medium">Send Reminder</h2>
          <LiaTimesSolid onClick={handleCancel} className="cursor-pointer" />
        </div>
        <div className="p-4">
          <p className="px-2 pb-1 pt-2 text-sm">Message</p>
          <div className="search-bg mb-3 items-center justify-between rounded-md focus:bg-[#FBFAFC] max-sm:mb-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-[120px] w-full rounded-md border-0 bg-transparent p-2 text-sm outline-none focus:outline-none"
              placeholder="Enter Your Message Here"
            />
          </div>
        </div>

        <div className="flex w-full justify-between gap-3 px-4 pb-4">
          <ButtonModule variant="secondary" className="w-full" onClick={handleCancel}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="black" className="w-full" onClick={handleConfirm}>
            Send
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SendReminderModal
