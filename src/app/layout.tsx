import { HouseholdComponent } from "@/components/context/household";
import "./globals.css";
import { LiffComponent } from "@/components/context/liff";
import { UserAuthComponent } from "@/components/context/user";
import { VConsoleLoader } from "@/components/VConsoleLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>
        <VConsoleLoader />
        <LiffComponent>
          <UserAuthComponent>
            <HouseholdComponent>
              {children}
            </HouseholdComponent>
          </UserAuthComponent>
        </LiffComponent>
      </body>
    </html>
  );
}
