import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;
const environment = process.env.PINECONE_ENVIRONMENT;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is not defined");
}

if (!environment) {
  throw new Error("PINECONE_ENVIRONMENT is not defined");
}

const pinecone = new Pinecone({
  apiKey: apiKey,
});

// Access your index
export const notesIndex = pinecone.Index("nextjs-ai-note-app");
