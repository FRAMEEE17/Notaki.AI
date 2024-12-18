import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface NotePageProps {
  params: {
    noteId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function NotePage({
  params: { noteId },
  searchParams,
}: NotePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!note) {
    redirect("/notes");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link 
          href="/notes"
          className="inline-flex items-center text-sm hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Link>
      </div>
      
      <div className="rounded-lg border p-6">
        <h1 className="text-2xl font-bold mb-4">{note.title}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          Created: {new Date(note.createdAt).toLocaleString()}
        </div>
        <div className="prose max-w-none">
          {note.content}
        </div>
      </div>
    </div>
  );
}