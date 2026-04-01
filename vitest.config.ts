import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
