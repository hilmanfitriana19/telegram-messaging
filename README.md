# TELEGRAM MESSAGING DASHBOARD

A simple React/TypeScript dashboard for sending messages with a Telegram bot.

## Prerequisites

- **Node.js** >=18 (see `.nvmrc`)
- A Telegram bot token

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

### Build

```bash
npm run build
```

### Deployment

```bash
npm run deploy
```

## Bot Token

The bot token is verified in the application and stored unencrypted in your
browser's `localStorage`. Only use this app on trusted machines and with
non‑critical bot accounts.

You can send messages to any chat listed in the dashboard or manually specify a
chat ID or channel username in the message form to send to groups or channels.
When selecting a supergroup with forums, the form shows a dropdown of active
threads so you can post directly to a topic. You can also manually enter a
thread ID.

## License

This project is licensed under the [MIT License](LICENSE).
