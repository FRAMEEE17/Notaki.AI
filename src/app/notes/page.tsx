import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotesPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in?redirectUrl=/notes");

  const allNotes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div>
      {/* Added stylish header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
          My Notes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...allNotes].map((note) => ( 
          <Link href={`/notes/${note.id}`} key={note.id}>
            <div className="h-[300px] overflow-y-auto hover:bg-accent/50 rounded-lg transition-colors border p-4 cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
              <div className="text-sm text-muted-foreground mb-2">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {note.content}
              </div>
            </div>
          </Link>
        ))}
        {allNotes.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            {"You don't have any notes yet."}
          </div>
        )}
      </div>
    </div>
  );
}