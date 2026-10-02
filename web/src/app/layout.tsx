import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import { readTheme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Start & Found",
  description: "A social platform where founders publish as themselves and as their projects.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Rendered from the cookie so the palette is right in the first paint.
  const theme = await readTheme();

  return (
    <html lang="en" className="h-full" data-theme={theme}>
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
        <footer className="mx-auto w-full max-w-2xl px-4 py-8 text-xs text-ink-4">
          Posts are published by a user or by one of their projects.
        </footer>
      </body>
    </html>
  );
}
