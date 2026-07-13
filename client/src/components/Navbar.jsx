import React, { useState, useContext } from 'react'
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { UserContext } from '../context/UserContext';
import AuthModel from './AuthModel';

/**
 * Navbar Component
 * Renders the top navigation bar of the application.
 * Highlights:
 * 1. Exposes authentication options or current credits balance if logged in.
 * 2. Toggles user account popup and credit info popup.
 * 3. Handles application logout by hitting the backend API and clearing context state.
 */
function Navbar() {
    // Access global user profile state and set State function from UserContext
    const { userData, setUserData } = useContext(UserContext)

    // Popup toggles
    const [showCreditPopup, setShowCreditPopup] = useState(false) // Credits breakdown bubble
    const [showUserPopup, setShowUserPopup] = useState(false)     // Logout dropdown bubble
    const [showAuth, setShowAuth] = useState(false);               // Modal dialog for login

    const navigate = useNavigate()

    /**
     * Clear JWT cookie on the backend, reset client state, and redirect home
     */
    const handleLogout = async () => {
        try {
            // POST/GET logOut request to clear server token cookie
            await axios.get(ServerUrl + "/api/auth/logout" , { withCredentials: true })
            
            // Clean up client-side state
            setUserData(null)
            setShowCreditPopup(false)
            setShowUserPopup(false)
            
            // Redirect back to landing page
            navigate("/")

        } catch (error) {
            console.error("Logout error:", error)
        }
    }

  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
        <div className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>
            
            {/* Left side: Brand Logo / Home trigger */}
            <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <BsRobot size={18}/>
                </div>
                <h1 className='font-semibold hidden md:block text-lg'>InterviewIQ</h1>
            </div>

            {/* Middle: Standard Navigation Links */}
            <div className='hidden lg:flex items-center gap-8 font-medium text-gray-600'>
                <button onClick={() => navigate('/')} className='hover:text-black transition'>Home</button>
                <button onClick={() => { if(!userData) { setShowAuth(true); return; } navigate('/interview') }} className='hover:text-black transition'>Interview</button>
                <button onClick={() => { if(!userData) { setShowAuth(true); return; } navigate('/history') }} className='hover:text-black transition'>History</button>
                <button onClick={() => navigate('/pricing')} className='hover:text-black transition'>Pricing</button>
            </div>

            {/* Right side: Session State (Credits & Profile Account bubble) */}
            <div className='flex items-center gap-6  relative'>
                
                {/* Credit balance toggle box */}
                <div className='relative'>
                    <button onClick={()=>{
                        if(!userData){
                            setShowAuth(true) // Prompt sign-in modal if trying to check balance
                            return;
                        }
                        setShowCreditPopup(!showCreditPopup);
                        setShowUserPopup(false)
                    }} className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition'>
                        <BsCoin size={20}/>
                        {userData?.credits || 0}
                    </button>

                    {/* Credit Popup Tooltip */}
                    {showCreditPopup && (
                        <div className='absolute right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50'>
                            <p className='text-sm text-gray-600 mb-4 text-center'>Need more credits to continue interviews?</p>
                            <button onClick={()=>navigate("/pricing")} className='w-full bg-black text-white py-2 rounded-lg text-sm'>Buy more credits</button>
                        </div>
                    )}
                </div>

                {/* Profile bubble and Logout Dropdown */}
                <div className='relative'>
                    <button
                        onClick={()=>{
                            if(!userData){
                                setShowAuth(true) // Open login dialog
                                return;
                            }
                            setShowUserPopup(!showUserPopup);
                            setShowCreditPopup(false)
                        }} 
                        className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'
                    >
                        {/* Display User first initial, or standard icon if logged out */}
                        {userData ? userData?.name.slice(0,1).toUpperCase() : <FaUserAstronaut size={16}/>}
                    </button>

                    {/* Profile Dropdown Tooltip */}
                    {showUserPopup && (
                        <div className='absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
                            <p className='text-md text-blue-500 font-medium mb-1 truncate'>{userData?.name}</p>
                            <button onClick={()=>navigate("/history")} className='w-full text-left text-sm py-2 hover:text-black text-gray-600'>Interview History</button>
                            <button onClick={handleLogout} 
                                className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 hover:text-red-700'
                            >
                                <HiOutlineLogout size={16}/>
                                Logout
                            </button>
                        </div>
                    )}
                </div>

            </div>

        </div>

        {/* Global Login Modal Popup */}
        {showAuth && <AuthModel onClose={()=>setShowAuth(false)}/>}
      
    </div>
  )
}

export default Navbar
