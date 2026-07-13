import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"

// Load variables from .env file into process.env so our code can read config keys
dotenv.config()

// Create the Express application instance
const app = express()

// CORS (Cross-Origin Resource Sharing) Configuration
// Allows the React frontend (running on CLIENT_URL) to send requests to this backend.
// credentials: true is critical so the browser sends JWT cookies back and forth.
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

// Middleware: Express JSON Parser
// Parses incoming JSON request payloads and exposes them in 'req.body'
app.use(express.json())

// Middleware: Cookie Parser
// Parses cookies sent in the request headers and exposes them in 'req.cookies'
app.use(cookieParser())

// Main API Routes definitions
// Routes incoming requests to their respective controllers
app.use("/api/auth", authRouter)       // Google authentication flow (login, logout)
app.use("/api/user", userRouter)       // User profile fetching
app.use("/api/interview", interviewRouter) // Interview generation, scoring, and reports
app.use("/api/payment", paymentRouter)   // Razorpay order creation and validation

// Start Server on PORT (configured port or fallback to 6000)
const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    // Establish connection to MongoDB Atlas database
    connectDb()
})
