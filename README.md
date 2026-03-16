# InterviewIQ 🚀

InterviewIQ is an advanced AI-powered platform designed to provide interactive, intelligent mock interviews. Built with the MERN stack (MongoDB, Express, React, Node.js), it empowers candidates to practice technical and behavioral interviews with real-time feedback and intelligent conversational flows powered by Large Language Models (LLMs) via OpenRouter.

## 🎯 Features

- **AI-Driven Mock Interviews**: Simulates real interview scenarios using OpenRouter LLM API.
- **Secure Authentication**: Robust user sign-up and login securely managed by Firebase Authentication.
- **Seamless Payments**: Integrated Razorpay gateway to handle premium tier subscriptions easily.
- **Interactive Dashboard**: Track your interview history, performance metrics, and actionable feedback.
- **Responsive UI**: Built with React, Vite, and modern CSS/Tailwind for an excellent user experience on all devices.
- **Micro-Services Architecture**: Decoupled frontend (`client`) and backend (`server`) applications.

## 💻 Tech Stack

### Frontend (Client)
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS / Custom CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth
- **PDF Generation**: `jspdf` & `jspdf-autotable`

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenRouter API
- **Payments Integration**: Razorpay

## 📂 Project Structure

```text
3.interviewIQ/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application views (Auth, Dashboard, Interview, Pricing)
│   │   ├── redux/          # Global state management
│   │   └── utils/          # Helper configurations (e.g., firebase.js)
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node/Express Backend
│   ├── config/             # Database and service configurations
│   ├── controllers/        # Route logic and handlers
│   ├── middlewares/        # Express middlewares (e.g., isAuth.js)
│   ├── models/             # MongoDB Mongoose schemas
│   ├── routes/             # API endpoints definitions
│   ├── services/           # External service integrations
│   ├── index.js            # Main backend entry point
│   └── package.json
│
└── render.yaml             # Render Blueprint Infrastructure-as-code
```

## 🛠️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Atlas Account](https://www.mongodb.com/)
- [Firebase account](https://firebase.google.com/) for Authentication
- [Razorpay account](https://razorpay.com/) (Optional: for payment testing)
- [OpenRouter API Key](https://openrouter.ai/) for the AI models

### 1. Clone the Repository
```bash
git clone https://github.com/Pintu241/interview-iq.git
cd interview-iq/3.interviewIQ
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
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
node index.js
# or use nodemon if installed globally
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

## 🚀 Deployment

This application is configured for seamless deployment on **Render.com** using Infrastructure-as-Code via the `render.yaml` Blueprint.

1. Connect your GitHub repository to Render.
2. Under "New+", select **Blueprint**.
3. Point the Blueprint Path to `3.interviewIQ/render.yaml`.
4. Render will automatically provision:
   - **Static Site** for the React Frontend.
   - **Web Service** for the Node Backend.
5. In the Render Dashboard, add your `.env` variables to both the Frontend and Backend service environments. Render's internal networking automatically connects `VITE_API_URL` to `CLIENT_URL`.

*(Note: Ensure your Render domain is added to your Firebase Authorized Domains to allow production log-ins!)*

---
*Created with ❤️ by Pintu241*
