# Hermes Research iOS App

A ChatGPT-style iOS client for **Hermes Agent** — your autonomous research assistant.

## Features

- **ChatGPT-inspired UI/UX** — clean, minimal, dark-mode native interface
- **SSE Streaming** — real-time response display via Server-Sent Events
- **OpenAI-compatible API** — works with Hermes Agent's built-in HTTP API server
- **Conversation history** — local persistence with AsyncStorage
- **Markdown rendering** — assistant responses with full markdown support
- **Settings** — configure server URL, API key, and model

## Screenshots

| Chat | Sidebar | Settings |
|------|---------|----------|
| Main chat with streaming | Conversation history | Server config |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo dev server:
   ```bash
   npx expo start
   ```

3. Open on your device:
   - Scan QR code with **Expo Go** (iOS)
   - Or press `i` for iOS simulator
   - Or press `w` for web preview

## Configuration

In the Settings screen:
- **Server URL**: Your Hermes Agent API endpoint (e.g., `https://hermes.sharathchenna.top`)
- **API Key**: The `API_SERVER_KEY` from your Hermes config
- **Model**: Model name to use (default: `hermes`)

## Architecture

```
├── app/             # Expo Router screens
│   ├── _layout.tsx  # Root layout (stack navigator)
│   ├── index.tsx    # Main chat screen
│   └── settings.tsx # Settings modal
├── components/      # Reusable UI components
│   ├── ChatMessage.tsx    # Message bubble with markdown
│   ├── Composer.tsx       # Bottom input bar
│   ├── Sidebar.tsx        # Conversation history drawer
│   └── TypingIndicator.tsx
├── services/        # API & storage layer
│   ├── api.ts       # OpenAI-compatible Hermes client
│   └── storage.ts   # AsyncStorage persistence
├── stores/          # Zustand state management
│   └── chatStore.ts
├── types/           # TypeScript definitions
└── constants/       # Theme & colors
```

## Tech Stack

- **Expo SDK 54** + React Native
- **Expo Router** (file-based routing)
- **Zustand** (state management)
- **react-native-markdown-display** (markdown rendering)
- **AsyncStorage** (local persistence)

## Related

- [Hermes Agent](https://hermes-agent.nousresearch.com) — autonomous AI agent
- [Hermes API Server](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/open-webui) — API documentation
