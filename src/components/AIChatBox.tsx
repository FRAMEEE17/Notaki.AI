'use client';

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedAIResponse {
  thought?: string;
  action?: string;
  response: string;
  observation?: string;
}

function parseAIResponse(content: string): ParsedAIResponse {
  // Handle empty or undefined content
  if (!content) {
    return { response: '' };
  }

  const sections: ParsedAIResponse = {
    response: content // Default to showing full content if parsing fails
  };

  try {
    // Extract sections using regex with multiline flag
    const thoughtMatch = content.match(/Thought:\s*([^\n]*)/m);
    const actionMatch = content.match(/Action:\s*([^\n]*)/m);
    const responseMatch = content.match(/Response:\s*([^\n]*)/m);
    const observationMatch = content.match(/Observation:\s*([^\n]*)/m);

    if (responseMatch) {
      sections.thought = thoughtMatch?.[1]?.trim();
      sections.action = actionMatch?.[1]?.trim();
      sections.response = responseMatch[1]?.trim();
      sections.observation = observationMatch?.[1]?.trim();
    }

    return sections;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return { response: content };
  }
}

export default function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat({
    streamProtocol: 'text'  //new version of the stream protocol
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-36",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={onClose} className="mb-1 ms-auto block" title="Close">
        <XCircle size={30} />
      </button>
      <div className="flex h-[600px] flex-col rounded border bg-background shadow-xl">
        <div className="mt-3 h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{ role: "assistant", content: "Thinking..." }}
            />
          )}
          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: `Error: ${error.message || 'Something went wrong. Please try again.'}`
              }}
            />
          )}
          {!error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              <Bot />
              {"Hey there, I'm your AI assistant. Ask me anything!"}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-1">
          <Button
            type="button"
            title="Clear Chat"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setMessages([])}
          >
            <Trash />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
            ref={inputRef}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const { user } = useUser();
  const isAiMessage = role === "assistant";

  // Enhanced parseAIResponse function
  const parseAIResponse = (content: string): {
    thought?: string;
    action?: string;
    response: string;
    observation?: string;
  } => {
    if (!content) return { response: '' };

    try {
      // First, check if it's a greeting or simple response
      if (!content.includes('Thought:') && !content.includes('Action:')) {
        return { response: content };
      }

      // Extract sections using regex
      const sections = {
        thought: content.match(/Thought:\s*((?:(?!Action:|Response:|Observation:).)*)/s)?.[1]?.trim(),
        action: content.match(/Action:\s*((?:(?!Thought:|Response:|Observation:).)*)/s)?.[1]?.trim(),
        response: '',
        observation: content.match(/Observation:\s*((?:(?!Thought:|Action:|Response:).)*)/s)?.[1]?.trim(),
      };

      // Extract response - handle both formatted and unformatted responses
      const responseMatch = content.match(/Response:\s*((?:(?!Thought:|Action:|Observation:).)*)/s)?.[1];
      if (responseMatch) {
        // Clean up any placeholder text
        sections.response = responseMatch
          .replace(/\[ตอบคำถามในรูปแบบที่เหมาะสม\]/g, '')
          .replace(/\[.*?\]/g, '')
          .trim();
      } else {
        // If no Response: marker found, use the whole content
        sections.response = content;
      }

      // If response is empty after cleanup, use original content
      if (!sections.response) {
        sections.response = content;
      }

      return sections as { thought?: string; action?: string; response: string; observation?: string; };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return { response: content };
    }
  };

  // Parse AI response if it's from the assistant
  const parsedContent = isAiMessage ? parseAIResponse(content) : { response: content };

  // Function to format text with bullet points
  const formatText = (text: string) => {
    if (!text) return "";
    
    // Handle multi-line text with bullet points
    return text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        return `<div key=${i} class="ml-4 my-1">● ${trimmedLine.slice(1).trim()}</div>`;
      }
      return line;
    }).join('\n');
  };

  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAiMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    >
      {isAiMessage && <Bot className="mr-2 shrink-0" />}
      <div
        className={cn(
          "rounded-md border px-4 py-3",
          isAiMessage ? "bg-background" : "bg-primary text-primary-foreground",
          "max-w-[85%]"
        )}
      >
        {isAiMessage ? (
          <div className="space-y-2">
            <div 
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ 
                __html: formatText(parsedContent.response)
              }}
            />
            
            {parsedContent.response.split('\n').length > 3 && parsedContent.observation && (
              <div className="mt-4 border-t pt-2 text-sm opacity-80">
                <div className="mt-2 text-muted-foreground">
                  {parsedContent.observation}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-line">{parsedContent.response}</p>
        )}
      </div>
      {!isAiMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="user image"
          width={100}
          height={100}
          className="ml-2 h-10 w-10 rounded-full object-cover"
        />
      )}
    </div>
  );
}