import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import dns from 'dns'
import tsconfigPaths from 'vite-tsconfig-paths'

dns.setDefaultResultOrder('verbatim')
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr({ svgrOptions: { icon: true } })],
  server: {
    port: 3000
  },
})
