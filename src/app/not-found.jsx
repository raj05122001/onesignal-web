// app/not-found.jsx   ← no "use client"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">404 – Page Not Found</h1>
      <p className="text-muted-foreground">
        Sorry, the page you were looking for does not exist.
      </p>
    </div>
  );
}
