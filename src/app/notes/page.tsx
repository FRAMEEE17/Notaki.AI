import Note from "@/components/Note";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "NISAGO - Notes",
};

export default async function NotesPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in?redirectUrl=/notes");  // ส่งไปหน้า login

  const allNotes = await prisma.note.findMany({
    where: { userId },
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allNotes.map((note) => {
        return (
          <Note key={note.id} note={note} />
        );
      })}
      {allNotes.length === 0 && <div className="col-span-full text-center">{"You don't have any notes yet."}</div>}
    </div>
  );
}
