import React, { useState, useContext } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { ServerUrl } from '../App';
import { UserContext } from '../context/UserContext';

/**
 * Pricing Component
 * Displays available plan cards (Free, Starter, Pro) and coordinates client-side Razorpay payments.
 */
function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("free"); // Stores ID of currently selected plan card
  const [loadingPlan, setLoadingPlan] = useState(null);       // Tracks ID of active order processing to disable buttons
  const { setUserData } = useContext(UserContext)             // Context hook to update credits in profile on success

  // Define available plans and benefits
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 500,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "500 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true, // User gets this by default, card has no purchase trigger
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 1000,
      description: "Great for focused practice and skill improvement.",
      features: [
        "1000 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 1500,
      description: "Best value for serious job preparation.",
      features: [
        "1500 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  /**
   * Initiates payment flow using Razorpay Gateway
   * Steps:
   * 1. Request backend to create a unique Razorpay Order.
   * 2. Open standard checkout overlay window.
   * 3. On successful user payment, hit the backend validation endpoint.
   * 4. Update the user profile balance on positive verification response.
   */
  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id)

      // Deduce price based on plan card ID
      const amount =  
      plan.id === "basic" ? 100 :
      plan.id === "pro" ? 500 : 0;

      // 1. Post details to backend to generate order transaction
      const result = await axios.post(ServerUrl + "/api/payment/order" , {
        planId: plan.id,
        amount: amount,
        credits: plan.credits,
      },{ withCredentials: true })
      
      // 2. Formulate payment configuration options for Razorpay Popup overlay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Test Key Id
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewIQ",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        // Callback handler executed when payment succeeds on client overlay
        handler: async function (response) {
          // 3. Post verification payload (ids and signature) to backend
          const verifypay = await axios.post(ServerUrl + "/api/payment/verify" , response, { withCredentials: true })
          
          // 4. Update context state with user details returned from backend
          setUserData(verifypay.data.user)

          alert("Payment Successful 🎉 Credits Added!");
          navigate("/")
        },
        theme:{
          color: "#10b981",
        },
      }

      // Initialize and open Razorpay overlay screen
      const rzp = new window.Razorpay(options)
      rzp.open()

      setLoadingPlan(null);
    } catch (error) {
     console.error("Payment error details:", error)
     setLoadingPlan(null);
    }
  }

  return (
    <div className='min-h-screen bg-gradient-dynamic py-16 px-6'>

      {/* Header Back button */}
      <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>
        <button onClick={() => navigate("/")} className='mt-2 p-3 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition'>
          <FaArrowLeft className='text-gray-600' />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>

      {/* Card Grid layouts */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id

          return (
            <div key={plan.id}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-8 transition-all duration-300 border 
                ${isSelected
                  ? "border-emerald-500 shadow-xl bg-white/95 scale-[1.01]"
                  : "border-gray-200/50 glass-card shadow-md hover:shadow-lg"
                }
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {/* Card Ribbon Badges */}
              {plan.badge && (
                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              {plan.default && (
                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Default
                </div>
              )}

              {/* Card headers */}
              <h3 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h3>

              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {plan.price}
                </span>
                <p className="text-gray-500 mt-1 text-sm">
                  {plan.credits} Credits
                </p>
              </div>

              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              {/* Bullet Features listing */}
              <div className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                    <span className="text-gray-700 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Purchase button trigger */}
              {!plan.default &&
                <button
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Stops card selection check from triggering twice on button click
                    if (!isSelected) {
                      setSelectedPlan(plan.id)
                    } else {
                      handlePayment(plan)
                    }
                  }} 
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition text-sm ${isSelected
                    ? "bg-emerald-600 text-white hover:opacity-90 shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}
                </button>
              }
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Pricing
