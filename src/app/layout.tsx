import "./globals.css";
import { LiffComponent } from "@/components/context/liff";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LiffComponent>
          {children}
        </LiffComponent>
      </body>
    </html>
  );
}
