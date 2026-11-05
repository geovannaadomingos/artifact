import type { Metadata } from "next";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { TRPCProvider } from "@/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager | Next.js 15 & tRPC",
  description:
    "Full-stack task management application featuring Next.js 15 App Router, Server-Side Rendering (SSR), and tRPC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <TRPCProvider>
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <span>TaskManager</span>
                </Link>

                <nav className="flex items-center gap-4 text-sm font-medium">
                  <Link
                    href="/"
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Tasks
                  </Link>
                  <Link
                    href="/tasks/new"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    + New Task
                  </Link>
                </nav>
              </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
              {children}
            </main>

            <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
              <div className="max-w-5xl mx-auto px-4">
                <p>
                  Technical Challenge • Next.js 15 (App Router) • tRPC • SSR • TypeScript
                </p>
              </div>
            </footer>
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
