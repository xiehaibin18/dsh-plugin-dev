export const HOST_CLIENT_MODULES = ['react', 'react/jsx-runtime', 'react-dom'] as const

export function assertRuntimeImports(source: string, target: 'server' | 'client') {
  // Scan emitted code because bundler metadata also lists imports eliminated by tree shaking.
  for (const dependency of new Bun.Transpiler({ loader: 'js' }).scanImports(source)) {
    const allowed =
      target === 'server'
        ? dependency.path.startsWith('node:')
        : HOST_CLIENT_MODULES.some((name) => name === dependency.path)
    if (!allowed) throw new Error(`Unexpected ${target} runtime dependency: ${dependency.path}`)
  }
}
