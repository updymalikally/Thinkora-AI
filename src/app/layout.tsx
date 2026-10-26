import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = { title: "Thinkora AI", description: "A clear space to think with AI." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><ThemeProvider>{children}<Toaster richColors position="top-right" /></ThemeProvider></body></html>; }

