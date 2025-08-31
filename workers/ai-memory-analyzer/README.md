# AI Memory Analyzer Worker

A Cloudflare Worker that uses Workers AI to analyze cultural memories and extract structured data.

## Features

- AI-powered memory analysis using Llama 3.1 8B Instruct
- Cultural element extraction
- Emotional significance analysis
- Metadata generation (tags, categories, titles)
- Fallback structured extraction when AI parsing fails

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your Cloudflare account:
```bash
npx wrangler login
```

3. Set your account ID in wrangler.toml or use:
```bash
npx wrangler whoami
```

## Development

Run locally:
```bash
npm run dev
```

## Deployment

Deploy to Cloudflare:
```bash
npm run deploy
```

## Environment Variables

Set in your Next.js app:
```env
CLOUDFLARE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

## Usage

The worker expects a POST request with:
```json
{
  "content": "Memory text to analyze",
  "culturalContext": [],
  "language": "en",
  "userId": "user123"
}
```

Returns structured analysis data including cultural elements, emotional significance, tags, and metadata.
