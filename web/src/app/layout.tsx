import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import RightRail from "@/components/RightRail";
import { readTheme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Start & Found",
  description: "A social platform where founders publish as themselves and as their projects.",
};

export default async function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  // Rendered from the cookie so the palette is right in the first paint.
  const theme = await readTheme();

  return (
    <html lang="en" className="h-full" data-theme={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Clarity+City:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <div className="mx-auto grid min-h-screen w-full max-w-[1200px] grid-cols-1 md:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,720px)_300px]">
          <Nav />
          <div className="min-h-screen min-w-0 border-line md:border-r">
            <main className="min-h-[calc(100vh-64px)] px-4 py-6 pb-24 md:px-5 md:pb-8">{children}</main>
            <footer className="border-t border-line px-5 py-6 text-xs text-ink-4">
              Posts are published by a user or by one of their projects.
            </footer>
          </div>
          <RightRail />
        </div>
        {modal}
      </body>
    </html>
  );
}
