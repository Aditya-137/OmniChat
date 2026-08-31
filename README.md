# OmniChat (Omni2)

OmniChat is a multi-provider, **"Bring Your Own Key" (BYOK)** AI chat web application. Users can configure their own API keys for **Groq**, **Google Gemini**, **OpenAI**, **Anthropic (Claude)**, and **xAI (Grok)**, and converse across multiple models from a single unified, dark-themed interface.

---

## Quick Start Guide

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:3000`.

### 2. Start the React Web Frontend

```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. Open this URL in your browser.

---

## Project Structure

```
Omni2/
├── backend/                  # Express + LangChain multi-provider backend
│   ├── src/
│   │   ├── adapters/         # Provider adapters (Groq, Google, OpenAI, Anthropic, Grok)
│   │   ├── controllers/      # Chat and model controllers
│   │   ├── routes/           # /chat, /models, /keys, /conversations
│   │   └── config/           # Firebase Admin and LLM configurations
│   └── package.json
│
├── frontend/                 # React 19 + Vite + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/       # Chat, layout, modals, settings, and common UI
│   │   ├── context/          # AuthContext, ConversationContext, AlertContext
│   │   ├── views/            # ChatView, AuthView
│   │   ├── config/           # Firebase Web client setup
│   │   ├── utils/            # Storage, time, and API helpers
│   │   ├── types/            # TypeScript interfaces & definitions
│   │   ├── index.css         # OLED dark mode tokens & custom scrollbars
│   │   ├── App.tsx           # Application shell & context wrappers
│   │   └── main.tsx          # React entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── context.md                # Full technical specification & architecture
├── transition.md             # Migration plan & React translation matrix
└── README.md
```

---

## Features & Highlights

- **Multi-Provider BYOK**: Enter your API keys in the Settings modal (Groq, Gemini, OpenAI, Claude, Grok).
- **Filtered Model Selection**: Only models matching your active configured keys appear in the dropdown.
- **Two-Tier Persistence**: Synchronous local caching (`localStorage`) + background Cloud Firestore persistence.
- **Disappearing Chat Mode**: Ephemeral in-memory chat session (purple badge) with confirmation prompt on exit.
- **System Prompts**: Set custom instructions per session with live character count.
- **Markdown & Syntax Highlighting**: Full Markdown support, tables, blockquotes, and code syntax highlighting with one-click copy buttons.
- **Themed Modal Dialogs**: Custom dark-mode dialogs for alerts, warnings, errors, and destructive confirmations.