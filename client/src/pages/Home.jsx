import React, { useContext, useState } from 'react'
import Navbar from '../components/Navbar'
import { UserContext } from '../context/UserContext'
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import AuthModel from '../components/AuthModel';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer';

/**
 * Home Component
 * The landing page of the InterviewIQ platform. 
 * Formatted with simple, clean Tailwind CSS layout and no heavy animations.
 */
function Home() {
  const { userData } = useContext(UserContext)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gradient-dynamic flex flex-col'>
      <Navbar />

      <div className='flex-1 px-6 py-20'>
        <div className='max-w-6xl mx-auto'>

          {/* Badge Intro */}
          <div className='flex justify-center mb-6'>
            <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2'>
              <HiSparkles size={16} className="text-green-600" />
              AI Powered Smart Interview Platform
            </div>
          </div>

          {/* Main Hero Header */}
          <div className='text-center mb-28'>
            <h1 className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'>
              Practice Interviews with{' '}
              <span className='bg-green-100 text-green-600 px-5 py-1 rounded-full whitespace-nowrap'>
                AI Intelligence
              </span>
            </h1>

            <p className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'>
              Role-based mock interviews with smart follow-ups,
              adaptive difficulty, and real-time performance evaluation.
            </p>

            {/* Quick Action buttons */}
            <div className='flex flex-wrap justify-center gap-4 mt-10'>
              <button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return;
                  }
                  navigate("/interview")
                }}
                className='bg-black text-white px-10 py-3 rounded-full hover:bg-gray-900 transition shadow-md font-medium'
              >
                Start Interview
              </button>

              <button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return;
                  }
                  navigate("/history")
                }}
                className='border border-gray-300 bg-white px-10 py-3 rounded-full hover:bg-gray-50 transition font-medium'
              >
                View History
              </button>
            </div>
          </div>

          {/* Steps section */}
          <div className='flex flex-col md:flex-row justify-center items-center gap-10 mb-28'>
            {
              [
                {
                  icon: <BsRobot size={24} />,
                  step: "STEP 1",
                  title: "Role & Experience Selection",
                  desc: "AI adjusts difficulty based on selected job role."
                },
                {
                  icon: <BsMic size={24} />,
                  step: "STEP 2",
                  title: "Smart Voice Interview",
                  desc: "Dynamic follow-up questions based on your answers."
                },
                {
                  icon: <BsClock size={24} />,
                  step: "STEP 3",
                  title: "Timer Based Simulation",
                  desc: "Real interview pressure with time tracking."
                }
              ].map((item, index) => (
                <div key={index}
                  className={`
                    relative bg-white rounded-3xl border border-gray-200 p-10 w-80 max-w-[90%] shadow-md hover:shadow-lg transition-all duration-300
                    ${index === 1 ? "md:-mt-6 shadow-lg border-green-200" : ""}
                  `}
                >
                  <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-white border border-green-500 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-md'>
                    {item.icon}
                  </div>
                  <div className='pt-10 text-center'>
                    <div className='text-xs text-green-600 font-semibold mb-2 tracking-wider'>{item.step}</div>
                    <h3 className='font-semibold mb-3 text-lg text-gray-800'>{item.title}</h3>
                    <p className='text-sm text-gray-500 leading-relaxed'>{item.desc}</p>
                  </div>
                </div>
              ))
            }
          </div>

          {/* AI Features section */}
          <div className='mb-32'>
            <h2 className='text-3xl font-semibold text-center mb-16 text-gray-800'>
              Advanced AI <span className="text-green-600">Capabilities</span>
            </h2>

            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    image: evalImg,
                    icon: <BsBarChart size={20} />,
                    title: "AI Answer Evaluation",
                    desc: "Scores communication, technical accuracy, and confidence."
                  },
                  {
                    image: resumeImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Resume Based Interview",
                    desc: "Project-specific questions based on uploaded resume."
                  },
                  {
                    image: pdfImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Downloadable PDF Report",
                    desc: "Detailed strengths, weaknesses, and improvement insights."
                  },
                  {
                    image: analyticsImg,
                    icon: <BsBarChart size={20} />,
                    title: "History & Analytics",
                    desc: "Track progress with performance graphs and topic analysis."
                  }
                ].map((item, index) => (
                  <div key={index}
                    className='bg-white border border-gray-150 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all'
                  >
                    <div className='flex flex-col md:flex-row items-center gap-8'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-64' />
                      </div>

                      <div className='w-full md:w-1/2'>
                        <div className='bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6'>
                          {item.icon}
                        </div>
                        <h3 className='font-semibold mb-3 text-xl text-gray-850'>{item.title}</h3>
                        <p className='text-gray-500 text-sm leading-relaxed'>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Interview modes section */}
          <div className='mb-32'>
            <h2 className='text-3xl font-semibold text-center mb-16 text-gray-800'>
              Multiple Interview <span className="text-green-600">Modes</span>
            </h2>

            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    img: hrImg,
                    title: "HR Interview Mode",
                    desc: "Behavioral and communication based evaluation."
                  },
                  {
                    img: techImg,
                    title: "Technical Mode",
                    desc: "Deep technical questioning based on selected role."
                  },
                  {
                    img: confidenceImg,
                    title: "Confidence Detection",
                    desc: "Basic tone and voice analysis insights."
                  },
                  {
                    img: creditImg,
                    title: "Credits System",
                    desc: "Unlock premium interview sessions easily."
                  }
                ].map((mode, index) => (
                  <div key={index}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className='flex items-center justify-between gap-6'>
                      <div className="w-1/2">
                        <h3 className="font-semibold text-xl mb-3 text-gray-850">
                          {mode.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {mode.desc}
                        </p>
                      </div>

                      <div className="w-1/2 flex justify-end">
                        <img
                          src={mode.img}
                          alt={mode.title}
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  )
}

export default Home
