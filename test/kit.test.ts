import { afterEach, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PreviewAppearanceControls } from '@xiehaibin18/dsh-plugin-dev/appearance'
import { HOST_CLIENT_MODULES, assertRuntimeImports } from '@xiehaibin18/dsh-plugin-dev/build'
import { startPreview } from '@xiehaibin18/dsh-plugin-dev/preview'
import page from './index.html'

const previewPort = process.env.PREVIEW_PORT
afterEach(() => {
  if (previewPort === undefined) delete process.env.PREVIEW_PORT
  else process.env.PREVIEW_PORT = previewPort
})

test('serves the preview and passes other requests to the caller', async () => {
  process.env.PREVIEW_PORT = '0'
  const server = startPreview({
    page,
    defaultPort: 4317,
    fetch: (request) => new Response(new URL(request.url).pathname === '/fixture' ? 'Synthetic data' : null),
  })
  try {
    expect(server.hostname).toBe('127.0.0.1')
    expect(await (await fetch(server.url)).text()).toContain('Development kit test')
    expect((await fetch(new URL('/favicon.ico', server.url))).status).toBe(204)
    expect(await (await fetch(new URL('/fixture', server.url))).text()).toBe('Synthetic data')
  } finally {
    await server.stop(true)
  }
})

test('rejects an invalid port override', () => {
  process.env.PREVIEW_PORT = '-1'
  expect(() => startPreview({ page, defaultPort: 4317 })).toThrow('PREVIEW_PORT must be an integer from 0 to 65535')
})

test('preserves the host module boundary for emitted client and server code', () => {
  expect(HOST_CLIENT_MODULES).toEqual(['react', 'react/jsx-runtime', 'react-dom'])
  const client = HOST_CLIENT_MODULES.map((name) => `require(${JSON.stringify(name)})`).join('\n')
  expect(() => assertRuntimeImports(client, 'client')).not.toThrow()
  expect(() => assertRuntimeImports('import "node:fs"', 'server')).not.toThrow()
  expect(() => assertRuntimeImports('require("react-dom/client")', 'client')).toThrow(
    'Unexpected client runtime dependency: react-dom/client',
  )
  expect(() => assertRuntimeImports('import "react"', 'server')).toThrow('Unexpected server runtime dependency: react')
})

test('renders language and theme choices with the selected values', () => {
  const html = renderToStaticMarkup(
    createElement(PreviewAppearanceControls, {
      language: 'en',
      theme: 'dark',
      onLanguageChange() {},
      onThemeChange() {},
    }),
  )
  expect(html).toContain('<label>界面语言<select>')
  expect(html).toContain('<option value="en" selected="">English</option>')
  expect(html).toContain('<label>主题<select>')
  expect(html).toContain('<option value="dark" selected="">深色</option>')
})
