# OmniChat — React Web Frontend

Modern, multi-provider AI chat web application built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Lucide Icons**, and **Firebase**.

## Features
- **Bring Your Own Key (BYOK)**: Supports Groq, Google Gemini, OpenAI, Claude (Anthropic), and xAI Grok.
- **Two-Tier Persistence**: Synchronous local browser caching + background Firebase Firestore cloud syncing.
- **Disappearing Chat Mode**: Privacy-focused ephemeral in-memory sessions.
- **Rich Markdown Display**: Syntax-highlighted code blocks with copy-to-clipboard, tables, and blockquotes.
- **Custom System Prompt**: Configure session instructions.
- **Themed Alert Modals**: Built-in dark dialog system replacing native browser alerts.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```
