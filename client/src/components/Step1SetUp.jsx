import React, { useState, useContext } from 'react';
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
} from "react-icons/fa";
import axios from "axios"
import { ServerUrl } from '../App';
import { UserContext } from '../context/UserContext';

/**
 * Step1SetUp Component
 * This is the first step of the interview process. It allows the candidate to:
 * 1. Manually enter their desired job role and years of experience.
 * 2. Select the type of interview (Technical or HR).
 * 3. Upload their resume (PDF format) and analyze it to automatically extract role, experience, projects, and skills.
 * 4. Initiate the AI interview by requesting the backend to generate relevant questions.
 */
function Step1SetUp({ onStart }) {
    // Access user data from the global React UserContext
    const { userData, setUserData } = useContext(UserContext)

    // Form inputs and selection states
    const [role, setRole] = useState("");              // Job role (e.g. Full Stack Developer)
    const [experience, setExperience] = useState("");  // Experience description (e.g. 2 years)
    const [mode, setMode] = useState("Technical");      // Mode of interview (Technical vs HR)
    const [resumeFile, setResumeFile] = useState(null);  // Stores the uploaded resume PDF file object

    // UI Loading states
    const [loading, setLoading] = useState(false);      // Set to true while generating questions
    const [analyzing, setAnalyzing] = useState(false);  // Set to true while parsing the resume PDF

    // Extracted details from the analyzed resume
    const [projects, setProjects] = useState([]);      // List of projects parsed from resume
    const [skills, setSkills] = useState([]);          // List of skills parsed from resume
    const [resumeText, setResumeText] = useState("");  // Raw text extracted from the PDF pages
    const [analysisDone, setAnalysisDone] = useState(false); // Controls whether the resume analysis UI box is shown

    /**
     * Sends the uploaded PDF file to the backend to parse text and extract structured information.
     */
    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        // Using FormData to send file binary via multipart/form-data POST request
        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            // POST to the backend resume analysis endpoint
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            console.log("Resume analysis result:", result.data)

            // Populate the input fields and states with the parsed AI results
            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            
            // Mark analysis as finished to show results
            setAnalysisDone(true);
            setAnalyzing(false);

        } catch (error) {
            console.error("Resume analysis error:", error)
            setAnalyzing(false);
        }
    }

    /**
     * Submits the form data to request AI-generated interview questions and starts the interview.
     */
    const handleStart = async () => {
        setLoading(true)
        try {
            // Sends current role, experience, mode, and resume details to the backend
            const result = await axios.post(ServerUrl + "/api/interview/generate-questions", {
                role, 
                experience, 
                mode, 
                resumeText, 
                projects, 
                skills 
            }, { withCredentials: true }) 
            
            console.log("Generated questions data:", result.data)
            
            // Update the user's credits balance in the UserContext
            if (userData) {
                setUserData({ ...userData, credits: result.data.creditsLeft })
            }
            
            setLoading(false)
            // Trigger the onStart callback passed from parent to transition to Step 2 (Interview Phase)
            onStart(result.data)

        } catch (error) {
            console.error("Error starting interview:", error)
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-55 px-4 py-8'>

            {/* Main setup container box */}
            <div className='w-full max-w-6xl bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden border border-gray-150'>

                {/* Left side: Information and Features introduction banner */}
                <div className='bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center border-r border-gray-100'>

                    <h2 className="text-4xl font-bold text-gray-800 mb-6">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 mb-10 text-base leading-relaxed">
                        Practice real interview scenarios powered by AI.
                        Improve communication, technical skills, and confidence.
                    </p>

                    <div className='space-y-5'>
                        {
                            [
                                {
                                    icon: <FaUserTie className="text-green-600 text-xl" />,
                                    text: "Choose Role & Experience",
                                },
                                {
                                    icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                                    text: "Smart Voice Interview",
                                },
                                {
                                    icon: <FaChartLine className="text-green-600 text-xl" />,
                                    text: "Performance Analytics",
                                },
                            ].map((item, index) => (
                                <div key={index}
                                    className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100'
                                >
                                    {item.icon}
                                    <span className='text-gray-700 font-medium'>{item.text}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Right side: Setup Form Inputs */}
                <div className="p-12 bg-white">

                    <h2 className='text-3xl font-bold text-gray-800 mb-8'>
                        Interview SetUp
                    </h2>

                    <div className='space-y-6'>
                        {/* Role input field */}
                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Enter role'
                                className='w-full pl-12 pr-4 py-3 border border-gray-250 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-gray-700 bg-white'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                        </div>

                        {/* Experience input field */}
                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Experience (e.g. 2 years)'
                                className='w-full pl-12 pr-4 py-3 border border-gray-250 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-gray-700 bg-white'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />
                        </div>

                        {/* Mode Select Dropdown */}
                        <select value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className='w-full py-3 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-gray-750 bg-white'
                        >
                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>
                        </select>

                        {/* Resume upload box (Visible only if resume has not been analyzed yet) */}
                        {!analysisDone && (
                            <div
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className='border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition'
                            >
                                <FaFileUpload className='text-4xl mx-auto text-green-600 mb-3' />

                                <input type="file"
                                    accept="application/pdf"
                                    id="resumeUpload"
                                    className='hidden'
                                    onChange={(e) => setResumeFile(e.target.files[0])} />

                                <p className='text-gray-600 font-medium text-sm'>
                                    {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                                </p>

                                {/* Analyse Button - appears only when a file is selected */}
                                {resumeFile && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stops parent container click handler from triggering file input dialog again
                                            handleUploadResume()
                                        }}
                                        className='mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium'
                                    >
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Results block showing extracted resume data */}
                        {analysisDone && (
                            <div className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4'>
                                <h3 className='text-lg font-semibold text-gray-800'>
                                    Resume Analysis Result</h3>

                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 mb-1 text-sm'>Projects:</p>
                                        <ul className='list-disc list-inside text-gray-600 space-y-1 text-sm'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 mb-1 text-sm'>Skills:</p>
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span key={i} className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold'>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Start Interview Button */}
                        <button
                            onClick={handleStart}
                            disabled={!role || !experience || loading}
                            className='w-full disabled:bg-gray-400 bg-green-600 hover:bg-green-750 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'
                        >
                            {loading ? "Starting..." : "Start Interview"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step1SetUp
