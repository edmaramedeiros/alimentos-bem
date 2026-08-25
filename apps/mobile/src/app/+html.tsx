import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="description" content="Sistema de vendas, clientes e comissões da Edmara Medeiros - alimentos do bem." />
        <meta name="theme-color" content="#70754D" />
        <title>Edmara Medeiros - alimentos do bem</title>

        <link rel="manifest" href="/sistema/manifest.json" />
        <link rel="icon" href="/sistema/favicon.png" />
        <link rel="apple-touch-icon" href="/sistema/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Edmara Medeiros" />
        <meta name="mobile-web-app-capable" content="yes" />

        <ScrollViewStyleReset />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sistema/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
