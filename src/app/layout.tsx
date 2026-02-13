import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VOIDSPACE",
    template: "%s | VOIDSPACE",
  },
  description:
    "VOIDSPACE is a visual node canvas SaaS UI built with Next.js and React Flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
