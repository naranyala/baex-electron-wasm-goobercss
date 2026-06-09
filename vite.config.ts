import { defineConfig } from 'vite'
import path from 'node:path'
import fs from 'node:fs'

function wasmServe() {
  return {
    name: 'wasm-serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.wasm')) {
          // Resolve relative to project root or node_modules
          const candidates = [
            path.join(process.cwd(), req.url),
            path.join(process.cwd(), 'node_modules', req.url),
          ]
          // Also handle scoped packages like /@sqlite.org/sqlite-wasm/dist/sqlite3.wasm
          const urlPath = req.url.replace(/^\//, '')
          candidates.push(path.join(process.cwd(), 'node_modules', urlPath))

          for (const filePath of candidates) {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              res.setHeader('Content-Type', 'application/wasm')
              fs.createReadStream(filePath).pipe(res)
              return
            }
          }
        }
        next()
      })
    },
  }
}

export default defineConfig(async () => {
  const plugins = [wasmServe()]

  if (!process.env.VITE_NO_ELECTRON) {
    const { default: electron } = await import('vite-plugin-electron/simple')
    plugins.push(
      electron({
        main: {
          entry: 'src/main/main.ts',
        },
        preload: {
          input: path.join(__dirname, 'src/main/preload.ts'),
        },
        renderer: process.env.NODE_ENV === 'test' ? undefined : {},
      })
    )
  }

  return {
    plugins,
    optimizeDeps: {
      exclude: ['@sqlite.org/sqlite-wasm'],
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
  }
})
