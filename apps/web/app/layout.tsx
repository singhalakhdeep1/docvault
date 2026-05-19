import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { QueryProvider } from "@/lib/providers/query-provider";

export const metadata: Metadata = {
  title: "DocsVault",
  description: "Realtime collaborative document editor",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

