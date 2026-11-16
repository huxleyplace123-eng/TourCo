import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// Separate build: this local sample is not included in the production site build.
export default defineConfig({plugins:[react()],server:{host:'127.0.0.1',port:5181,strictPort:true,open:false},build:{outDir:'node_modules/.payment-rehearsal-build',rollupOptions:{input:'payment-rehearsal/index.html'}}});
