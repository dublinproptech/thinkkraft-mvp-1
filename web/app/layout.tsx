import type { Metadata } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import { Providers } from "./providers";
import { authOptions } from "@/lib/auth";

// Load the two theme fonts once, here, and expose them as CSS variables
// (--font-body, --font-head) that globals.css consumes. Doing it in the root
// layout means every page inherits the same typography with zero extra work.
const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
});
const head = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-head",
});

export const metadata: Metadata = {
  title: "ThinkKraft",
  description: "Creative coding for children, human-led and AI-supported.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${body.variable} ${head.variable}`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}