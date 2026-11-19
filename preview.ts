import type { HTMLBundle } from 'bun'

interface PreviewOptions {
  page: HTMLBundle
  defaultPort: number
  fetch?: (request: Request) => Response | Promise<Response>
}

export function startPreview({ page, defaultPort, fetch }: PreviewOptions) {
  const port = process.env.PREVIEW_PORT === undefined ? defaultPort : Number(process.env.PREVIEW_PORT)
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PREVIEW_PORT must be an integer from 0 to 65535')
  }
  return Bun.serve({
    hostname: '127.0.0.1',
    port,
    development: { hmr: true, console: true },
    routes: { '/': page, '/favicon.ico': new Response(null, { status: 204 }) },
    fetch,
  })
}
