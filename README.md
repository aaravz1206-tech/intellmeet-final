# 🚀 IntellMeet - AI-Powered Real-Time Collaboration & Meeting Platform

IntellMeet is an industry-grade, feature-rich, and AI-powered collaborative conferencing platform. By combining real-time communication via **WebRTC** and **Socket.io** with state-of-the-art **Google Gemini AI**, IntellMeet redefines online meetings. Beyond video and audio, it provides real-time speech translations, live multi-user whiteboard collaboration, synchronized meeting notes, instant polls, task tracking, and automated meeting summarization with AI-generated action items.

---

## 🎨 Key Features

### 📡 Real-Time Communication & Interaction
- **WebRTC Video & Audio Streaming**: Standard-compliant peer-to-peer audio and video transmission with secure STUN relaying.
- **Simulated Virtual Media Stream**: If a participant does not have camera or microphone permissions, the system automatically draws a pulsing visualizer circle on an HTML Canvas and captures the stream so the video call remains active.
- **Collaborative Whiteboard**: Multi-user drawing board supporting different colors, stroke sizes, an eraser tool, canvas wiping, and downloading the final board as a PNG. Synchronized across participants via WebSockets.
- **Real-Time Cursor Tracking**: Participants' mouse coordinates are broadcasted in real time, rendering colored cursors with labels for enhanced spatial collaboration.
- **Interactive Hand Raising & Reactions**: Raise hands to request permission to speak and send floatable emoji reactions.
- **Live Interactive Polls**: Create and vote on polls with real-time feedback charts displaying results to all participants immediately.

### 💬 Rich Chat & File Sharing
- **Real-Time Text Chat**: Synchronous text discussion with timestamps and participant details.
- **File & Attachment Sharing**: Upload local files through the chat interface (stored on the backend using `multer`) and broadcast download links to participants in real time.
- **Emoji Reactions**: Sync reactions to specific messages, recording user counts and participants who reacted.

### 🧠 Gemini AI Powered Capabilities
- **Real-Time Multilingual Translations**: During calls, transcripts are generated and automatically translated in the background using Gemini AI into Spanish (`es`), French (`fr`), German (`de`), Hindi (`hi`), and Japanese (`ja`).
- **AI Meeting Summaries**: At the end of a meeting, Gemini AI analyzes the entire live transcript and chat logs to generate a JSON summary containing an overview, key topics, decisions, and tone analysis.
- **Automated Action Items & Tasks**: The summary automatically extracts task items, assigns them, defines deadlines, and inserts them into the MongoDB database as active `Task` models visible on the dashboard.
- **AI Chat Assistant**: Ask questions directly to an integrated AI assistant inside the meeting room, which leverages the current transcript and chat history to provide contextual answers.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (JSX)
- **Styling**: Vanilla CSS + Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Real-Time Signals**: Socket.io Client
- **Assets & Icons**: Lucide React
- **Authentication**: Google OAuth2 (`@react-oauth/google`)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (ES Modules)
- **Real-Time Server**: Socket.io Server
- **Database**: MongoDB & Mongoose (ODM)
- **AI Core**: Google Generative AI (`@google/generative-ai` - using `gemini-1.5-flash`)
- **File Uploads**: Multer
- **Email Dispatch**: Nodemailer (SMTP)
- **Security**: JSON Web Token (JWT) & BcryptJS
- **Email Validation**: Deep Email Validator (SMTP, MX records, typo checks)

---

## 📂 Project Directory Structure

```text
intellmeet/
├── client/                     # React Single Page Application
│   ├── public/                 # Static assets (logo, icons)
│   ├── src/
│   │   ├── assets/             # Component-level static resources
│   │   ├── components/
│   │   │   ├── Auth/           # Login & Register views (incl. Google login)
│   │   │   ├── Dashboard/      # Main application dashboard (tasks, friends, meetings)
│   │   │   └── Meeting/        # Active conferencing room, layout, and Whiteboard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Handlers for signup, login, session validation
│   │   │   ├── MeetingContext.js# Peer-to-peer WebRTC connections & workspace syncing
│   │   │   └── SocketContext.js# Low-level connection events and Socket.io instances
│   │   ├── App.jsx             # Main router and view controllers
│   │   ├── index.css           # Styling directives and Tailwind config
│   │   └── main.jsx            # Entry point rendering App DOM tree
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Client dependencies and scripts
│
├── server/                     # Node/Express Backend Server API
│   ├── public/
│   │   └── uploads/            # Root folder storing uploaded documents & files
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose MongoDB database integration
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT Token decoding & endpoint protection
│   │   ├── models/
│   │   │   ├── Meeting.js      # Schema for meetings, notes, polls, transcripts, chat
│   │   │   ├── Task.js         # Auto-generated task schema for actions
│   │   │   └── User.js         # Schema for members, credentials, and friends
│   │   ├── routes/
│   │   │   ├── auth.js         # Routes for registration, authentication, OAuth
│   │   │   ├── meetings.js     # Routes for saving/retrieving meeting documents
│   │   │   ├── tasks.js        # Routes for creating, modifying, deleting tasks
│   │   │   ├── ai.js           # Routes interfacing with Google Generative AI (Gemini)
│   │   │   ├── files.js        # File upload router
│   │   │   ├── friends.js      # User directory and friendship managers
│   │   │   └── invite.js       # SMTP mailing list routes to join rooms
│   │   ├── services/
│   │   │   └── socket.js       # Socket.io relay service (WebRTC signal, drawing, coordinates)
│   │   └── server.js           # API entry point & static serving configuration
│   └── package.json            # Server dependencies and commands
│
├── netlify.toml                # Configuration for Netlify client deployments
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Variables Configuration

Both the frontend client and the backend server require environment configuration. Create `.env` files in their respective folders.

### 🖥 Backend Server Configuration (`server/.env`)
Create a file named `.env` inside the `server` directory:

```env
# Server details
PORT=5000
NODE_ENV=development

# Database connection
MONGODB_URI=mongodb://127.0.0.1:27017/intellmeet

# Authentication Secrets
JWT_SECRET=your_jwt_secret_key_here

# Client URL (for CORS allowance)
CLIENT_URL=http://localhost:5173

# Google Authentication credentials (for Google Login)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Google Gemini API Access (Required for summary, action items, chat, translations)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# SMTP Configuration (Optional, for inviting friends/users to join meetings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

### 💻 Frontend Client Configuration (`client/.env`)
Create a file named `.env` inside the `client` directory:

```env
# Google OAuth Client ID (must match backend configuration)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Node.js**: Version 18.x or higher installed.
- **MongoDB**: Make sure MongoDB is running locally (e.g. `mongodb://localhost:27017`) or have a remote MongoDB Atlas connection URI.
- **Git**: For cloning/handling code.

---

### Step 1: Set up the Database
Make sure your MongoDB server is active. If running locally, you can start it using:
```bash
# Windows (if registered as a service)
net start MongoDB

# Linux / macOS
mongod --dbpath /data/db
```

---

### Step 2: Set up the Backend Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create and populate the `.env` file as specified in the **Environment Variables** section.
4. Run the server:
   - **Development Mode** (auto-restarts on save using `nodemon`):
     ```bash
     npm run dev
     ```
   - **Production Mode**:
     ```bash
     npm start
     ```
   You should see:
   ```text
   Connecting to MongoDB at: mongodb://127.0.0.1:27017/intellmeet
   🟢 MongoDB Connected Successfully 🟢
   🚀 IntellMeet Backend running on: http://localhost:5000 🚀
   🔌 WebSockets server active & listening on same port.
   ```

---

### Step 3: Set up the Frontend Client
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Create and populate the `.env` file with your Google Client ID.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the host address shown (typically `http://localhost:5173`).

---

## 🌎 Production Hosting & Deployment

### Serving the Client from the Backend Server
The server is configured to serve the production build of the client.
1. Build the frontend client:
   ```bash
   cd client
   ```
   ```bash
   npm run build
   ```
   This generates static files inside `client/dist`.
2. Move back to the server:
   ```bash
   cd ../server
   ```
3. Start the server in production mode:
   ```bash
   npm start
   ```
   The Express server will detect `client/dist` and serve it automatically on `http://localhost:5000`.

### Deploying to Netlify (Frontend)
The root directory includes a `netlify.toml` file. If hosting the client separately on Netlify:
- Link the repository to Netlify.
- Set the build settings to:
  - **Base Directory**: `client`
  - **Build Command**: `npm run build`
  - **Publish Directory**: `dist`
- Configure redirects to support client-side routing.
- Set the backend environment variable `CLIENT_URL` to point to your Netlify deployment domain.

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| **POST** | `/api/auth/register` | Register a new account | Public |
| **POST** | `/api/auth/login` | Email/Password login | Public |
| **POST** | `/api/auth/google` | Google OAuth verification | Public |
| **GET** | `/api/auth/me` | Fetch authenticated user data | Private |
| **PUT** | `/api/auth/profile` | Update profile details and avatar | Private |
| **POST** | `/api/ai/translate` | Translate text via Gemini AI | Private |
| **POST** | `/api/ai/summarize` | Summarize meeting & extract actions | Private |
| **POST** | `/api/ai/chat` | Ask questions to the meeting AI assistant | Private |
| **POST** | `/api/files/upload` | Upload meeting documents & assets | Private |
| **POST** | `/api/invite/send` | Dispatch meeting invite link via SMTP | Private |
| **GET** | `/api/meetings/:code` | Retrieve specific meeting configuration | Private |
| **GET** | `/api/tasks` | Fetch active user/meeting tasks | Private |
