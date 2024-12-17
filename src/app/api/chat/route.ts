import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import groq from "@/lib/groq";
import { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const messagesTruncated = messages.slice(-6);

    const embedding: number[] = await getEmbedding(
      messagesTruncated.map((message: { content: string }) => message.content).join("\n"),
    );

    const { userId } = await auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant notes found: ", relevantNotes);

    const systemMessage = {
      role: "system",
      content:
        "You are an intelligent AI-driven note-taking app. You answer the user's question based on their existing multilingual notes in Thai language grammatically in default. " +
        "The relevant notes for this query are:\n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n"),
    };

    const stream = await groq.chat.completions.create({
      messages: [systemMessage, ...messagesTruncated],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 2048,
      top_p: 0.5,
      stream: true,
    });

    const streamingResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(streamingResponse);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}