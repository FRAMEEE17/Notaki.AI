import NavBar from "./NavBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="container mx-auto p-4">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </>
  );
}