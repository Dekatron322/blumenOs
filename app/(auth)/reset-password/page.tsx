"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Footer from "components/Footer/Footer"
import InfoIcon from "public/info-icon"

const ForgotPassword: React.FC = () => {
  const [seconds, setSeconds] = useState(119)
  const [isCountdownFinished, setIsCountdownFinished] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (showSuccessNotification || showErrorNotification) {
      const timer = setTimeout(() => {
        setShowSuccessNotification(false)
        setShowErrorNotification(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showSuccessNotification, showErrorNotification])

  useEffect(() => {
    if (seconds === 0) {
      setIsCountdownFinished(true)
      return
    }

    const intervalId = setInterval(() => {
      setSeconds((prev: number) => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [seconds])

  return (
    <section className="flex h-screen flex-grow bg-[#F8F9FA]">
      <div className="flex w-full flex-col items-center max-sm:mt-10 md:mt-20">
        <div className="mb-4 flex items-center justify-center gap-2">
          <img src="/otech logo.svg" alt="profile" className="size-10" />
          <p className="text-xl font-semibold text-[#2a2f4b]">Otech MFB</p>
        </div>

        <div className=" h-auto rounded-lg p-4 max-sm:w-[95%] md:w-[428px]  md:border md:bg-[#FFFFFF] md:shadow-sm xl:w-[428px]">
          <div className="w-full justify-center   max-sm:p-4">
            <div className="mb-4  items-center border-b pb-2">
              <p className="text-lg font-semibold">Reset Password</p>
              <p className="text-sm">Click on the password reset link from your email to change your password.</p>
            </div>
          </div>

          <div className="space-y-2 ">
            <div className="flex w-full gap-2 rounded-md bg-[#E9F2FE] p-4">
              <InfoIcon />
              <p className="text-sm text-[#131319]">
                Password reset link has been sent to your email address <b>otechbankltd@gmail.com</b>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 max-sm:px-6 sm:w-[428px]">
          <p className="text-grey-400">
            Didn&apos;t receive the email? Please check your spam folder or try to resend.
          </p>
          <p className="pt-3 text-[#202B3C]">
            {isCountdownFinished ? (
              <span className="text-destructive font-semibold">Resend password reset link</span>
            ) : (
              `Resend password reset link in ${seconds}s`
            )}
          </p>
        </div>

        <Footer />
      </div>
    </section>
  )
}

export default ForgotPassword
