import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";

const appearanceInitScript = `
(() => {
  try {
    const theme = localStorage.getItem("sia-theme") || "light";
    const density = localStorage.getItem("sia-density") || "comfortable";
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("density-compact", density === "compact");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  } catch (_error) {
    // no-op
  }
})();
`;

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"]
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Sales Insight Automator",
  description: "Upload sales data and receive AI-generated executive insights."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: appearanceInitScript }} />
        {children}
      </body>
    </html>
  );
}
