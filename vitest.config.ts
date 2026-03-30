import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
