import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowRight } from 'react-icons/bs'

/**
 * Step2Interview Component
 * The active interview room. It operates as follows:
 * 1. AI starts with a pleasant audio introduction (text-to-speech).
 * 2. Questions are spoken out loud sequentially by the AI.
 * 3. The candidate answers using their microphone (speech-to-text voice recognition) or types directly.
 * 4. Timer tracks the response duration and auto-submits on timeout.
 * 5. Backend evaluates the answer and AI speaks the short evaluation feedback before proceeding.
 */
function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;

  // App Phases
  const [isIntroPhase, setIsIntroPhase] = useState(true); // True during AI welcoming speech

  // Microphone and Speech Recognition Refs/States
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null); // Reference to the Web Speech API recognition service

  // Text-To-Speech (TTS) states
  const [isAIPlaying, setIsAIPlaying] = useState(false); // True while AI is talking
  const [selectedVoice, setSelectedVoice] = useState(null); // Currently selected browser voice
  const [voiceGender, setVoiceGender] = useState("female"); // Male vs Female avatar & voice configuration
  const [subtitle, setSubtitle] = useState(""); // Live subtitles displayed below video

  // Interview state machine
  const [currentIndex, setCurrentIndex] = useState(0); // Current question index (0 to 4)
  const [answer, setAnswer] = useState(""); // Text representation of the user's spoken answer
  const [feedback, setFeedback] = useState(""); // Evaluation feedback from the AI
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60); // Seconds left for current question
  const [isSubmitting, setIsSubmitting] = useState(false); // True during API evaluation request

  const videoRef = useRef(null); // Reference to the avatar video HTML tag
  const currentQuestion = questions[currentIndex];
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // Initialize Speech Synthesis and find a natural-sounding voice
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Match known female voices
      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Match known male voices
      const maleVoice = voices.find(v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Default fallback
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [])

  /* ---------------- TEXT-TO-SPEECH (SPEAK FUNCTION) ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      // Cancel any ongoing speaking
      window.speechSynthesis.cancel();

      // Introduce short artificial pauses for speech pacing
      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;  // Slightly slower, natural cadence
      utterance.pitch = 1.05; // Slightly warmer tone
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic(); // Turn off mic to prevent AI speaking into its own recorder
        videoRef.current?.play(); // Animate avatar talking
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0; // Reset video to starting frame
        }
        setIsAIPlaying(false);

        // Turn mic back on if user wants it active
        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve(); // Resolve promise when speaking is completed
        }, 300);
      };

      setSubtitle(text); // Set visual subtitles
      window.speechSynthesis.speak(utterance);
    });
  };

  // Run Introduction speech, then speak questions sequentially
  useEffect(() => {
    if (!selectedVoice) return;

    const runIntroAndQuestions = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`);
        await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800)); // Small delay between phases

        // Mention difficulty check for the final question
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    }

    runIntroAndQuestions();
  }, [selectedVoice, isIntroPhase, currentIndex])

  // Timer countdown hook
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0; // Trigger auto-submission in other hook when timer hits 0
        }
        return prev - 1
      })
    }, 1000);

    return () => clearInterval(timer)
  }, [isIntroPhase, currentIndex])

  // Reset timer on question change
  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  // Speech Recognition (Speech-to-Text) Initialization
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("Speech recognition is not supported in this browser. Use Chrome/Safari.");
      return;
    }

    // Initialize Web Speech Recognition
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true; // Stay on even during silence
    recognition.interimResults = false; // Only final completed phrases

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      // Append translated text directly into text field
      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  // Submit Answer to backend for LLM Evaluation
  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: currentQuestion.timeLimit - timeLeft,
      }, { withCredentials: true })

      // AI speaks out feedback (e.g. "Great correctness, minor grammar issues")
      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
      console.error("Answer submission error:", error)
      setIsSubmitting(false)
    }
  }

  // Next Question or trigger finish
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    // If no more questions, call the API to generate the summary report
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  }

  // Conclude interview and compute overall scores
  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true })
      console.log("Completed report:", result.data)
      onFinish(result.data) // Transition UI to Step 3 (Report page)
    } catch (error) {
      console.error("Error finalizing interview:", error)
    }
  }

  // Auto-submit if timer expires
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer()
    }
  }, [timeLeft]);

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        {/* Left column: Avatar Video and Info */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-250'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-md'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Subtitles Overlay */}
          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

          {/* Timer and Status Box */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>Interview Status</span>
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>AI Speaking</span>}
            </div>
            <div className="h-px bg-gray-200"></div>

            {/* Circular Timer Component */}
            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400 block'>Current Question</span>
              </div>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                <span className='text-xs text-gray-400 block'>Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Textarea and Controls */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
              <p className='text-xs sm:text-sm text-gray-400 mb-2'>
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>{currentQuestion?.question}</div>
            </div>
          )}

          {/* Answer Textarea - Users can type here or speak into the mic */}
          <textarea
            placeholder="Type your answer here, or click the mic button below to dictate your response..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />

          {/* Action buttons: Mic & Submit OR Feedbacks & Next Question */}
          {!feedback ? (
            <div className='flex items-center gap-4 mt-6'>
              <button
                onClick={toggleMic}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-md transition ${
                  isMicOn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </button>

              <button
                onClick={submitAnswer}
                disabled={isSubmitting}
                className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-md hover:opacity-95 transition font-semibold disabled:bg-gray-400'
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          ) : (
            <div className='mt-6 bg-emerald-50 border border-emerald-250 p-5 rounded-2xl shadow-sm'>
              <p className='text-emerald-750 font-medium mb-4'>{feedback}</p>
              <button
                onClick={handleNext}
                className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1 text-sm font-semibold'
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2Interview
