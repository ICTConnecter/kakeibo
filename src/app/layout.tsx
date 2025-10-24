import "./globals.css";
import { LiffComponent } from "@/components/context/liff";
import Script from "next/script";

declare var VConsole: any;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <Script
        src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"
        onReady={() => {
          new VConsole();
        }}
      />
        <LiffComponent>
          {children}
        </LiffComponent>
      </body>
    </html>
  );
}
