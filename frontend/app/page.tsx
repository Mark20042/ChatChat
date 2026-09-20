"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, Zap, Shield, LayoutDashboard } from "lucide-react";
import { Dancing_Script } from "next/font/google";

const cursiveFont = Dancing_Script({ subsets: ["latin"], weight: ["700"] });

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
  }, []);

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 sm:p-10 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-zinc-100">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-md">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span>ChatChat</span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition shadow-sm inline-flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-zinc-100 px-3 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section (Centered) */}
      <main className="w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center my-auto py-6">
        
        {/* ONE SINGLE QUOTE (Mixing Cursive & Normal Text) */}
        <div className="mb-6">
          <p className="text-base sm:text-lg text-zinc-300 font-medium tracking-wide">
            "Where conversations{" "}
            <span className={`${cursiveFont.className} text-3xl sm:text-4xl text-zinc-100 font-bold px-1.5 drop-shadow-sm`}>
              connect people
            </span>{" "}
            effortlessly."
          </p>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-zinc-100">
          Simple, instant chat <br />
          for modern teams.
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
          Experience real-time messaging designed for teams. Fast, secure, and always synchronized.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-extrabold text-base transition-all shadow-lg active:scale-95"
            >
              Open Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold text-sm transition active:scale-95"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-900 text-left w-full">
          <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-400">
            <Zap className="h-4 w-4 text-zinc-200 shrink-0" />
            <span>Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-400">
            <Shield className="h-4 w-4 text-zinc-200 shrink-0" />
            <span>End-to-End Privacy</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-400 col-span-2 sm:col-span-1">
            <MessageSquare className="h-4 w-4 text-zinc-200 shrink-0" />
            <span>Always Connected</span>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900/60 pt-4">
        <span>&copy; {new Date().getFullYear()} ChatChat. All rights reserved.</span>
        <span>Minimalist Monochrome Edition</span>
      </footer>
    </div>
  );
}
