import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TurboISP",
};

export default function TurboispLayout({ children }: { children: React.ReactNode }) {
  return children;
}
