import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // '' prefix: also read non-VITE_ keys such as PORT from .env* files
    const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

    return {
        plugins: [vue()],
        base: process.env.BASE_URL || '/resume-vuejs-website/',

        server: {
            port: Number(env.PORT) || 5173,
            // the API's CORS allowlist has a fixed origin — fail on a busy port instead of moving to 5174
            strictPort: true,
        },

        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'), // Alias cho thư mục src
                components: path.resolve(__dirname, 'src/components'), // Alias cho thư mục components
                views: path.resolve(__dirname, 'src/views'), // Alias cho thư mục views
            },
        },
    }
})
