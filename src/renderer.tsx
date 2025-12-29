/** @jsxImportSource hono/jsx */
import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient, Script } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(() => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TodoList App</title>
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
      </head>
      <body>
        <div id="root"></div>
        <Script type="module" src="/src/client.tsx" />
      </body>
    </html>
  )
})
