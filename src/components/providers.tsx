"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/session-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThirdwebProvider>
        <SessionProvider>{children}</SessionProvider>
      </ThirdwebProvider>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "!bg-ink-soft !border-white/10 !text-white !rounded-2xl",
            description: "!text-white/60",
          },
        }}
      />
    </ThemeProvider>
  );
}
