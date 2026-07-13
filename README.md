# InterviewIQ 🚀

InterviewIQ is an advanced AI-powered platform designed to provide interactive, intelligent mock interviews. Built with the MERN stack (MongoDB, Express, React, Node.js), it empowers candidates to practice technical and behavioral interviews with real-time feedback and intelligent conversational flows powered by Large Language Models (LLMs) via Google Gemini or OpenRouter.

---

## 🎯 Features

- **AI-Driven Mock Interviews**: Simulates real interview scenarios using Google Gemini (Primary) or OpenRouter LLM API.
- **Secure Authentication**: Robust user sign-up and login securely managed by Firebase Authentication.
- **Seamless Payments**: Integrated Razorpay gateway to handle premium tier subscriptions easily.
- **Interactive Dashboard**: Track your interview history, performance metrics, and detailed feedback.
- **Clean Tailwind UI**: High-performance layout built with React, Vite, and static Tailwind CSS for zero lag and fast page loads (no heavy animations).
- **Lightweight State Management**: Utilizes native React Context (`UserContext`) instead of Redux for clean, readable code.
- **Micro-Services Architecture**: Decoupled frontend (`client`) and backend (`server`) applications matching clean MVC structure.

---

## 💻 Tech Stack & Dependencies

Here is the exact list of tools, libraries, and APIs used in this MERN stack application, explained in simple terms:

### 🌐 Frontend (Client)
* **React 19 & Vite**: The main library used to build the user interface and components, compiled using Vite for super-fast performance.
* **Tailwind CSS**: Used to style the entire website using simple, pre-made CSS classes. We removed all heavy animations (like framer-motion) to keep the UI static, simple, and clean.
* **React Context (`UserContext`)**: Replaced Redux to manage global user states (such as authentication status and remaining credits) using standard React functions.
* **React Router DOM**: Handles navigating between pages (Home, Login, Pricing, and History) without reloading the browser.
* **Firebase Authentication**: Opens the secure Google Sign-in popup window and manages user sessions.
* **Recharts**: Renders the green performance trend chart on the dashboard using simple data points.
* **React Icons**: Provides icons (like robots, coins, and microphones) to make the UI look clean and intuitive.

### ⚙️ Backend (Server)
* **Node.js & Express.js**: Powers the server that receives requests from our frontend and runs our controller files (MVC architecture).
* **Mongoose (MongoDB)**: Saves and manages user documents, credit balances, and interview reports in our database database.
* **Google Gemini 2.5 Flash (Primary AI)**: Generates interview questions and scores candidate answers. Integrated natively via REST calls to keep code lightweight.
* **OpenRouter API (AI Fallback)**: Automatically takes over to evaluate answers if no Gemini API key is configured.
* **Razorpay Node SDK**: Creates payment order transactions on the server so users can securely purchase credits.
* **Multer**: Exposes standard endpoints to let users upload their PDF resumes to the backend.
* **pdfjs-dist**: Extracts plain text from the uploaded PDF resume so the AI can read it.
* **jsonwebtoken (JWT)**: Generates secure session tokens saved in cookies to identify logged-in users.
* **cookie-parser**: Extracts the token from incoming request cookies so the `isAuth` middleware can verify it.
* **cors**: Configures cross-origin security rules so our frontend is allowed to talk to this backend.
* **dotenv**: Loads configuration keys (like database links and API secrets) from the `.env` file safely.

---

## 📂 Project Structure

```text
interview-iq/ (Root)
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components & Steps (Navbar, Step1-Step3)
│   │   ├── context/        # React Context (UserContext.jsx) replaces Redux
│   │   ├── pages/          # Application views (Auth, Dashboard, Interview, Pricing)
│   │   └── utils/          # Helper configurations (e.g., firebase.js)
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node/Express Backend (MVC Structure)
│   ├── config/             # Database and token configurations
│   ├── controllers/        # Controllers (Business logic - e.g. interview.controller.js)
│   ├── middlewares/        # Express middlewares (e.g., Auth, Multer)
│   ├── models/             # Mongoose Models (user, payment, interview)
│   ├── routes/             # Express routing
│   ├── services/           # AI services (openRouter.service.js supports Gemini + OpenRouter)
│   ├── index.js            # Main backend entry point
│   └── package.json
│
├── ARCHITECTURE.md         # In-depth system architecture & sequence flow explanation
└── render.yaml             # Render Blueprint Infrastructure-as-code
```

For a detailed view of data flows and request lifecycles, see the **[ARCHITECTURE.md](file:///c:/Users/syyad/Downloads/3.interviewIQ/ARCHITECTURE.md)** file.

---

## 🛠️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Atlas Account](https://www.mongodb.com/)
- [Firebase account](https://firebase.google.com/) for Authentication
- [Razorpay account](https://razorpay.com/) (Optional: for payment testing)
- [Gemini API Key](https://ai.google.dev/) (Primary LLM) or [OpenRouter API Key](https://openrouter.ai/) (Fallback LLM)

### 1. Clone the Repository
```bash
git clone https://github.com/Pintu241/interview-iq.git
cd interview-iq
```

### 2. Setup the Backend (Server)
Navigate to the server directory, install dependencies, and configure environment variables.
```bash
cd server
npm install
```
Create a `.env` file in the `server` root directory:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key       # Add this to use Gemini (Default)
OPENROUTER_API_KEY=your_openrouter_key   # Add this to fallback to OpenRouter
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:5173
```
Start the backend server in development mode (watches for changes with nodemon):
```bash
npm run dev
```

### 3. Setup the Frontend (Client)
Open a new terminal, navigate to the client directory, install dependencies, and configure environment variables.
```bash
cd client
npm install
```
Create a `.env` file in the `client` root directory:
```env
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_API_URL=http://localhost:8000
```
Start the React development server:
```bash
npm run dev
```

### 4. Open Application
Navigate to `http://localhost:5173` in your browser.

---

## 🚀 Deployment

This application is configured for seamless deployment on **Render.com** using Infrastructure-as-Code via the `render.yaml` Blueprint.

1. Connect your GitHub repository to Render.
2. Under "New+", select **Blueprint**.
3. Point the Blueprint Path to `render.yaml`.
4. Render will automatically provision:
   - **Static Site** for the React Frontend.
   - **Web Service** for the Node Backend.
5. In the Render Dashboard, add your `.env` variables to both the Frontend and Backend service environments. 
   - Specifically, make sure to add `GEMINI_API_KEY` to the **interviewiq-backend** environment variables.

*(Note: Ensure your Render domain is added to your Firebase Authorized Domains to allow production log-ins!)*

---
*Created with ❤️ by Pintu241*
