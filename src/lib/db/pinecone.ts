import { Pinecone, type PineconeConfiguration } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is not defined");
}

const config: PineconeConfiguration = {
  apiKey: apiKey,
};

// const pinecone = new Pinecone({
//   apiKey: apiKey 
// });
const pinecone = new Pinecone(config);

export const notesIndex = pinecone.Index("nextjs-ai-note-app");
