# NOTAKI.AI 🤖

An AI-powered note-taking assistant that helps you manage, analyze and answer about your notes intelligently.

## Demo 🎥
https://github.com/user-attachments/assets/cfb72aab-4710-4e3f-9a80-b71439e1c7dc

## Features 🌟

- **Smart Search**: Semantic search across all your notes by AI assistant
- **Multi-Language Support**: Primarily Thai and English
- **Context-Aware**: Understands relationships between notes
- **Friendly Interface**: Chat-based interaction

## Tech Stack 💻

- Next.js 15 (App Router)
- Groq (LLM)
- Vercel AI SDK
- Pinecone Vector DB (Notes Storage)
- Clerk Auth
- Tailwind CSS
- Prisma (ORM)
- MongoAtlas DB
  
## Getting Started 🚀

1. Clone the repository
```bash
git clone https://github.com/FRAMEEE17/Notaki.AI.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Add your API keys
DATABASE_URL="..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=...
NEXT_PUBLIC_CLERK_SIGN_UP_URL=...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=...
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=...
GROQ_API_KEY=...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=... #us-east-1-aws
```

4. Run the development server
```bash
npm run dev
```

## Future Plans 🔮
> Documents Management System 📚
- Support for PDF and PPTX formats
- Lecture notes storage and organization
- Knowledge graph embedding implementation
- Advanced search tools for educational materials
- Enhanced chat-based interaction with documents
- Guardrails LLM for production
- GraphRAG implementation for various domains
  
## Optimization
- Fine-tuning with study notes dataset (maybe various domains) and QA dataset for better response tones and patterns

**Friendly reminder: "streamProtocol: 'text'" is a latest version of AI-SDK React , if you didn't use it, it would fail to parse your output.
