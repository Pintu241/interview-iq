# InterviewIQ Frontend (Client) 🎨

This directory contains the React frontend codebase for **InterviewIQ**, powered by React 19, Vite, and Tailwind CSS.

## 🛠️ Tech Stack Features
* **Vite**: Ultra-fast hot module reloading and build processing.
* **Tailwind CSS**: Simple utility-first styling for static, high-performance UI layouts.
* **React Context (`UserContext`)**: Lightweight global state management for user authentication profiles and credit checking.
* **Firebase Authentication**: Pre-configured Google login popup integration.
* **Recharts**: Responsive visualization of candidate performance trends.

---

## 📂 Source Layout
```text
client/
├── src/
│   ├── assets/       # Video avatars and PNG icons
│   ├── components/   # Reusable elements (Navbar, Step1SetUp, Step2Interview, Step3Report)
│   ├── context/      # React state provider (UserContext.jsx)
│   ├── pages/        # Main route views (Home, Auth, Pricing, History)
│   ├── utils/        # Firebase configurations
│   ├── App.jsx       # App shell & session checker
│   └── main.jsx      # DOM entry point
├── package.json      # Dependency definitions
└── vite.config.js    # Bundler config
```

---

## ⚙️ Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root of the `client` directory:
   ```env
   VITE_FIREBASE_APIKEY=your_firebase_api_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   VITE_API_URL=http://localhost:8000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```
   *Note: Built assets will be generated in the `dist` directory.*
