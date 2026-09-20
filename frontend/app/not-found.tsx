import Link from "next/link";
import { Home, MessageSquare } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-md w-full text-center flex flex-col items-center">
        {/* Minimal 404 Large Display */}
        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-zinc-800 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
              <MessageSquare className="h-6 w-6 text-zinc-200" />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-xs leading-relaxed">
          Sorry, we couldn't find the page or conversation you were looking for.
        </p>

        {/* Clean Minimalist Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-sm transition shadow-sm"
          >
            <MessageSquare className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold text-sm transition"
          >
            <Home className="h-4 w-4 text-zinc-400" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
