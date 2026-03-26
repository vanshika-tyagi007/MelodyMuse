# React Music Website

A modern YouTube-powered music player built with React, Vite, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

1.  **Install Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
2.  **Get a YouTube API Key**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project.
    *   Enable **YouTube Data API v3**.
    *   Create Credentials (API Key).

### Installation

1.  Open this folder in your terminal (VS Code users: `Ctrl + ~`).
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Add your API Key**:
    *   Open `src/services/youtube.js`
    *   Replace `YOUR_YOUTUBE_API_KEY` with the key you got from Google.

### Running the App

Start the development server:
```bash
npm run dev
```

Open your browser to the URL shown (usually `http://localhost:5173`).

## 🛠 Features

*   **Search**: Find any song on YouTube.
*   **Play**: Listen to music (visualized via embedded player).
*   **Responsive**: Works on desktop and mobile.
*   **Dark Mode**: Sleek UI inspired by premium music apps.
