// // components/Modals/DeactivateCustomerModal.tsx
// "use client"

// import React, { useState } from "react"
// import Modal from "react-modal"
// import CloseIcon from "public/close-icon"
// import { ButtonModule } from "../Button/Button"
// import { notify } from "../Notification/Notification"

// interface DeactivateCustomerModalProps {
//   isOpen: boolean
//   onRequestClose: () => void
//   onSuccess?: () => void
//   customerId: string
//   customerName: string
// }

// const DeactivateCustomerModal: React.FC<DeactivateCustomerModalProps> = ({
//   isOpen,
//   onRequestClose,
//   onSuccess,
//   customerId,
//   customerName,
// }) => {
//   // const [deactivateCustomer, { isLoading }] = useDeactivateCustomerMutation()
//   const [error, setError] = useState("")

//   const handleDeactivate = async () => {
//     try {
//       // const response = await deactivateCustomer({
//       //   id: customerId,
//       //   customerStatus: false,
//       // }).unwrap()

//     //   if (response.succeeded) {
//     //     notify("success", "Customer deactivated", {
//     //       description: `${customerName} has been successfully deactivated`,
//     //     })
//     //     if (onSuccess) onSuccess()
//     //     onRequestClose()
//     //   } else {
//     //     setError(response.message || "Failed to deactivate customer")
//     //     notify("error", "Deactivation failed", {
//     //       description: response.message || "Failed to deactivate customer",
//     //     })
//     //   }
//     // } catch (err: any) {
//     //   const errorMessage = err.data?.message || "An error occurred while deactivating the customer"
//     //   setError(errorMessage)
//     //   notify("error", "Deactivation failed", {
//     //     description: errorMessage,
//     //   })
//     // }
//   // }

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onRequestClose}
//       className="mt-20 w-[350px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
//       overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
//       ariaHideApp={false}
//     >
//       <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
//         <h2 className="text-lg font-bold">Deactivate Customer</h2>
//         <div onClick={onRequestClose} className="cursor-pointer">
//           <CloseIcon />
//         </div>
//       </div>
//       <div className="px-4 pb-6">
//         <p className="my-4 text-sm">
//           Are you sure you want to deactivate <span className="font-semibold">{customerName}</span>? This will freeze
//           their account.
//         </p>

//         {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

//         <div className="flex w-full ">
//           <ButtonModule variant="black" size="lg" onClick={handleDeactivate} disabled={isLoading} className="w-full">
//             {isLoading ? (
//               <div className="flex items-center justify-center">
//                 <svg
//                   className="mr-2 size-5 animate-spin"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Deactivating...
//               </div>
//             ) : (
//               "Deactivate Customer"
//             )}
//           </ButtonModule>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// export default DeactivateCustomerModal
