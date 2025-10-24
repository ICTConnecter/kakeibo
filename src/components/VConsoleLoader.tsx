'use client';

import Script from 'next/script';

declare var VConsole: any;

export function VConsoleLoader() {
  return (
    <Script
      src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"
      onReady={() => {
        new VConsole();
      }}
    />
  );
}

