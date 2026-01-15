import "./globals.css";
import * as React from "react";

import { ThemeProvider } from "@/shared/shell/providers/theme-provider";
import { AppShell } from "@/shared/shell/AppShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
