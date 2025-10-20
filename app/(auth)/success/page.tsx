"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Footer from "components/Footer/Footer"

const Page: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const router = useRouter() // Initialize the router

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Simulate an API call or some asynchronous action
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowSuccessNotification(true)
      setLoading(false)

      // Redirect to the success page
      router.push("/reset-password")
    } catch (error) {
      setError("Failed to sign in. Please try again.")
      setShowErrorNotification(true)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-[#22266A]">
        <div className="auth flex rounded-[20px] bg-[#FFFFFF] max-sm:mb-40 max-sm:w-[95%] xl:max-w-[434px]">
          <div className="w-full justify-center px-[53px] py-[60px] max-sm:px-7">
            <div className=" flex items-center justify-center">
              <Image src="AuthImages/rafiki.svg" width={233.48} height={177.81} alt="profile" />
            </div>
            <div className="mb-8   items-center justify-center ">
              <p className="mb-3 text-center text-3xl font-medium text-[#111111]">Success</p>
              <p className="text-center text-xs">Password Reset link has been sent to Joh********16@gmail,com</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mt-5  w-full gap-6">
                <button
                  type="submit"
                  className="button-primary h-[50px] w-full rounded-md max-sm:h-[45px]"
                  disabled={loading}
                >
                  Resend
                </button>
                <button
                  type="submit"
                  className="button-outline mt-[10px] h-[50px] w-full rounded-md max-sm:h-[45px]"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
      {showSuccessNotification && (
        <div className="animation-fade-in absolute bottom-16 m-5  flex h-[50px] w-[339px] transform items-center justify-center gap-2 rounded-md border border-[#0F920F] bg-[#F2FDF2] text-[#0F920F] shadow-[#05420514] md:right-16">
          <Image src="/check-circle.svg" width={16} height={16} alt="dekalo" />
          <span className="clash-font text-sm  text-[#0F920F]">Login Successfully</span>
        </div>
      )}
      {showErrorNotification && (
        <div className="animation-fade-in 0 absolute bottom-16  m-5 flex h-[50px] w-[339px] transform items-center justify-center gap-2 rounded-md border border-[#D14343] bg-[#FEE5E5] text-[#D14343] shadow-[#05420514] md:right-16">
          <Image src="/check-circle-failed.svg" width={16} height={16} alt="dekalo" />
          <span className="clash-font text-sm  text-[#D14343]">{error}</span>
        </div>
      )}
    </>
  )
}

export default Page
