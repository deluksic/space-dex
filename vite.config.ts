import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'
import basicSsl from '@vitejs/plugin-basic-ssl'
// import devtools from 'solid-devtools/vite'
import postcssNetsing from 'postcss-nesting'
import solid from 'solid-start/vite'
import vercel from 'solid-start-vercel'

export default defineConfig({
  plugins: [
    // devtools({ autoname: true }),
    solid({
      ssr: true,
      adapter: vercel({ edge: false }),
    }),
    basicSsl(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    postcss: {
      plugins: [postcssNetsing, autoprefixer],
    },
  },
  server: {
    hmr: true,
    https: true,
  },
})
