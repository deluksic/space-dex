import solid from "solid-start/vite";
import { defineConfig } from "vite";
import devtools from 'solid-devtools/vite'
import postcssNetsing from 'postcss-nesting'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    devtools({ autoname: true }),
    solid({
      ssr: true,
    }),
    basicSsl(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    postcss: {
      plugins: [postcssNetsing],
    },
  },
  server: {
    hmr: true,
    https: true,
  },
});
