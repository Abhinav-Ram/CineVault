# 🎬 CineVault

An AI-powered cinema companion and movie night curator. CineVault uses Google's Gemini models paired with Google Search grounding to deliver movie night suitability checks, tailored vibe recommendations, aesthetic "Movie Editz" profiles, similarity matching, and head-to-head film comparisons.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setting Up the Gemini API Key](#-setting-up-the-gemini-api-key)
- [Local Installation & Development](#-local-installation--development)
- [Containerized Setup (Docker)](#-containerized-setup-docker)
  - [Option A: Quick Start with Docker Compose (Recommended)](#option-a-quick-start-with-docker-compose-recommended)
  - [Option B: Production Container with Nginx](#option-b-production-container-with-nginx)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [License](#-license)

---

## ✨ Features

- **Movie Checker**:
  - Detailed movie night suitability analysis based on your viewing group (family, date night, solo, friends, etc.).
  - Real-time rating aggregation from IMDb, Letterboxd, and Metacritic via Google Search grounding.
  - Content warnings (nudity, violence, profanity, substance use) with timestamp estimates when available.
  - Fun AI-generated custom T-shirt slogan and visual graphic for the film.
  - CineChat: in-depth conversational Q&A about any movie.
  - Instant high-resolution PDF report generation and download.
- **Movie Editzzz**:
  - Aesthetic edit profiles featuring aesthetic hooks, atmospheric mood summaries, and iconic sensory scene transitions.
  - Witty, sarcastic, and passionate Letterboxd-style micro-reviews.
  - Custom vibe and emotional angle overrides.
- **Movie Picker**:
  - Curate movie lists tailored by viewing company, pacing ("Fast & Furious", "Balanced", "Slow Burn"), standard genres, "Any Genre", or custom user-defined subgenres/tropes.
  - Multi-language filtering.
  - Single-movie reroll/replacement on demand.
  - Exportable PDF recommendation digests.
- **Movie Matcher**:
  - Find movies that match the specific energy, aesthetic, or narrative hook of another film.
  - Optional nuance prompt (e.g. *"I loved the sound design and rainy Tokyo setting"*).
  - Single-entry replacement button if you have already watched a pick.
- **Movie Comparer**:
  - Side-by-side head-to-head analysis of two or more films with recommendations based on specific viewing preferences.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI / LLM**: [@google/genai SDK](https://www.npmjs.com/package/@google/genai) (`gemini-3-flash-preview` / `gemini-2.5-flash` with Google Search Grounding)
- **PDF Generation**: [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (`html2canvas` + `jsPDF`)
- **Containerization**: Docker & Docker Compose (Node 20 Alpine & Nginx Alpine)

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm** (comes with Node.js) or **Bun** / **pnpm** / **yarn**
- **Docker** and **Docker Compose** *(optional, only if using containers)*
- A **Google Gemini API Key** (free tier available from Google AI Studio)

---

## 🔑 Setting Up the Gemini API Key

CineVault uses the Google Gemini API to analyze movies, summarize vibes, and query real-time data via search grounding.

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** in the left sidebar or navigate to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
4. Click **"Create API key"** and select or create a Google Cloud project.
5. Copy the generated API key.
6. In your cloned repository root, duplicate the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
7. Open `.env` in a text editor and add your API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyGoesHere
   ```

> ⚠️ **Security Warning**: Never commit your `.env` file or expose your API key publicly on GitHub. The `.gitignore` file is already configured to exclude `.env` and `.env.local`.

---

## 💻 Local Installation & Development

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cinevault.git
cd cinevault
```

### 2. Install Dependencies

```bash
npm install
```

*(Or if using Bun: `bun install`)*

### 3. Set Up Environment Variables

Ensure `.env` exists in the project root:

```bash
cp .env.example .env
```

Edit `.env` to supply your `GEMINI_API_KEY`.

### 4. Start the Development Server

```bash
npm run dev
```

The application will start on:
👉 **`http://localhost:3000`**

Vite will automatically reload when you modify code.

---

## 🐳 Containerized Setup (Docker)

If you prefer not to install Node.js locally or want a reproducible isolated environment, you can run CineVault using Docker.

### Option A: Quick Start with Docker Compose (Recommended)

This mounts the source code and automatically reads your local `.env` file.

1. Ensure your `.env` file is populated with your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   # Add your key to .env
   ```
2. Build and start the container:
   ```bash
   docker compose up --build
   ```
3. Open your browser at:
   👉 **`http://localhost:3000`**

To run in the background (detached mode):
```bash
docker compose up -d
```

To stop the containers:
```bash
docker compose down
```

---

### Option B: Production Container with Nginx

To build a lightweight, self-contained production image served via Nginx:

1. **Build the production Docker image**:
   Pass your `GEMINI_API_KEY` as a build argument so Vite can bundle it during static compilation:
   ```bash
   docker build --target prod --build-arg GEMINI_API_KEY="your_api_key_here" -t cinevault-prod .
   ```

2. **Run the container**:
   Map port `80` inside the container to port `8080` (or `3000`) on your host:
   ```bash
   docker run -d -p 8080:80 --name cinevault-app cinevault-prod
   ```

3. **Access the application**:
   👉 **`http://localhost:8080`**

To stop and remove the production container:
```bash
docker stop cinevault-app
docker rm cinevault-app
```

---

## 📜 Available Scripts

In the project root, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on `http://0.0.0.0:3000`. |
| `npm run build` | Compiles TypeScript and builds optimized static production assets into `dist/`. |
| `npm run preview` | Locally previews the production build from `dist/`. |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to validate type safety. |

---

## 📂 Project Structure

```
cinevault/
├── components/                 # React UI components
│   ├── AnalysisResult.tsx      # Detailed movie analysis card & score breakdown
│   ├── CineChat.tsx            # Interactive contextual AI chat
│   ├── DisambiguationOptions.tsx # Movie candidate picker for ambiguous titles
│   ├── Hero.tsx                # Landing header and query input
│   ├── LoadingAnimation.tsx    # Film reel loading animation
│   ├── MovieComparerTab.tsx    # Side-by-side film comparison tab
│   ├── MovieEditzTab.tsx       # Aesthetic mood & Letterboxd review tab
│   ├── MovieMatcherTab.tsx     # Similarity matcher tab
│   ├── RecommendationTab.tsx   # Curated movie picker tab
│   └── ReelMenu.tsx            # Navigation bar
├── services/
│   └── geminiService.ts        # Gemini API client, prompts, and search grounding
├── .dockerignore               # Docker ignore rules
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── Dockerfile                  # Multi-stage Dockerfile (dev & prod/nginx)
├── docker-compose.yml          # Docker Compose orchestration
├── index.html                  # HTML entry point (fonts, tailwind, html2pdf)
├── index.tsx                   # React root mount
├── metadata.json               # Project metadata & platform capabilities
├── package.json                # Project dependencies & scripts
├── README.md                   # Project documentation
├── tsconfig.json               # TypeScript configuration
├── types.ts                    # TypeScript shared interfaces and types
└── vite.config.ts              # Vite configuration (port 3000, env definition)
```

---

## ❓ Troubleshooting & FAQs

### 1. `GoogleGenAI Error: API_KEY is required` or 403 Forbidden
- **Cause**: The `GEMINI_API_KEY` was not found in `.env` or Vite was started before `.env` was created.
- **Fix**: Check that your `.env` file contains `GEMINI_API_KEY=AIzaSy...` with no surrounding quotes or extra spaces. Restart the dev server (`npm run dev`) after updating `.env`.

### 2. Port 3000 is already in use
- **Cause**: Another process or Docker container is running on port 3000.
- **Fix**: Stop the competing process or specify a different port in `vite.config.ts` or when running Docker (e.g. `-p 3001:3000`).

### 3. PDF Download is empty or missing styles
- **Fix**: The PDF generator waits for elements and images to render in memory. Ensure fonts and images are fully loaded before clicking the download button.

### 4. Search Grounding / Real-Time Data Rate Limits
- If you encounter rate limits (`RESOURCE_EXHAUSTED`), wait a few seconds before trying your search again, or check your quota in the [Google Cloud Console](https://console.cloud.google.com/) or [Google AI Studio](https://aistudio.google.com/).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
