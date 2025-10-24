import "./globals.css";
import { LiffComponent } from "@/components/context/liff";
import { VConsoleLoader } from "@/components/VConsoleLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <VConsoleLoader />
        <LiffComponent>
          {children}
        </LiffComponent>
      </body>
    </html>
  );
}
