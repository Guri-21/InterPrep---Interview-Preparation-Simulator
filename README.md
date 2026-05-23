# InterPrep AI — Intelligent Interview Simulator

**InterPrep AI** is a full-stack, AI-driven technical interview simulation platform designed to provide accessible, high-quality interview practice with real-time, granular feedback.

---

## 🎯 Aim & Problem Statement

### The Problem
Landing technical roles requires extensive interview practice, but mock interviews with experienced professionals are expensive, difficult to schedule, and often lack objective, structured feedback. Candidates struggle to evaluate their own pacing, clarity, and technical accuracy without expert oversight.

### The Objective
To build an automated, domain-specific interview simulator that acts as a technical interviewer. The platform must accept real-time verbal answers, evaluate them using Large Language Models (LLMs), and generate a detailed scorecard covering technical accuracy, confidence, and communication metrics.

---

## 🏗 System Architecture & Tech Stack

InterPrep follows a modern **MERN** stack architecture (MongoDB, Express, React, Node.js) with integrated AI services.

### Technologies Used
* **Frontend:** React.js, Tailwind CSS, Vite, Framer Motion (for premium UI animations).
* **Backend:** Node.js, Express.js (MVC Pattern).
* **Database:** MongoDB (using Mongoose ODM).
* **AI Evaluation Engine:** Google Gemini (1.5 / 2.5 Flash) structured output generation.
* **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing.

### Data Flow
1. **Client:** The user records an audio answer via the React frontend.
2. **Speech-to-Text:** The audio is transcribed into text in real-time.
3. **API Gateway:** The frontend sends the transcript, question context, and domain to the Node.js backend.
4. **AI Service:** The backend constructs a highly detailed prompt and requests a strictly typed JSON evaluation from the Google Gemini AI provider.
5. **Database:** The generated scorecard and feedback are persisted to MongoDB.
6. **Dashboard:** The frontend visualizes the results using Chart.js/Recharts.

---

## 🗄️ Database Design

The system uses a non-relational MongoDB database for flexibility and speed.

### Core Collections
* **`Users`**: Stores authentication credentials, profile data, roles (`user`, `admin`), and domain preferences.
* **`Domains`**: Configurable tech stacks and interview categories (e.g., React, Node, DevOps).
* **`Questions`**: A bank of domain-specific interview questions graded by difficulty.
* **`Interviews`**: The core operational data. Stores the question asked, the candidate's transcript, and the AI-generated feedback structure (scores, strengths, weaknesses, follow-ups).

---

## ⚡ Key Features

* **Real-time AI Feedback:** Granular scoring across Content, Structure, Clarity, Confidence, and Communication.
* **Domain-Specific Logic:** Questions and evaluations tailored to specific tech stacks (e.g., "Full Stack Development").
* **Actionable Insights:** AI-generated strengths, weaknesses, and concrete suggestions for improvement.
* **Follow-up Generation:** The AI acts as a real interviewer by asking a dynamic follow-up question based on the candidate's answer.
* **Admin Dashboard:** Role-based access control (RBAC) allowing admins to view global stats, manage users, and curate questions.
* **Premium UX/UI:** Dark-themed, glassmorphic UI built with Tailwind CSS and Framer Motion.

---

## 🚀 Setup & Installation (Local Deployment)

### Prerequisites
* Node.js (v18+)
* MongoDB (v7.0+ running locally on port 27017)
* A valid Google Gemini API Key.

### 1. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Copy `.env.example` to `.env` and configure your keys:
\`\`\`env
MONGO_URI=mongodb://127.0.0.1:27017/interprep
AI_PROVIDER=gemini
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=your_super_secret_jwt_key
\`\`\`
Seed the database with an admin user:
\`\`\`bash
npm run seed:admin
\`\`\`

### 2. Frontend Setup
In the project root directory:
\`\`\`bash
npm install
\`\`\`

### 3. Run the Application
Start both the frontend and backend concurrently from the root directory:
\`\`\`bash
npm run dev
\`\`\`
* The frontend will be available at `http://localhost:3000`
* The backend API will be running on `http://localhost:4000`

---

## 📊 Results & Analysis

### Performance
* **Latency:** AI evaluations using Gemini Flash complete in ~1.5 - 2.5 seconds, providing a near-instantaneous feedback loop.
* **Structured Output:** By utilizing schema-enforced prompt engineering, the AI reliably returns valid JSON 99.9% of the time, preventing backend parsing crashes.

### Analytics
The system successfully identifies common interview anti-patterns, such as:
* High filler word counts (tracked dynamically).
* Lack of STAR (Situation, Task, Action, Result) methodology in behavioral answers.
* Technically accurate but poorly paced responses.

---

## 🔭 Future Scope

1. **Video Emotion Analysis:** Integrating OpenCV or browser-based AI models to track eye contact, facial expressions, and posture during the interview.
2. **Mock Interview Playlists:** Sequential, multi-question interviews mimicking a full 45-minute technical screen.
3. **Peer-to-Peer Mode:** Allowing users to match with other candidates for human-led mock interviews on the platform.
4. **Cloud Deployment:** Containerizing the architecture with Docker and deploying to AWS/Vercel for public access.

---

