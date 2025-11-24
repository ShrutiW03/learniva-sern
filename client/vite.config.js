import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 5173 // Ensures your client runs on port 5173
  }
})

// ### **4. How to Run It**

// 1.  **Open Terminal** in the root `learniva-sern/` folder.
// 2.  **Set your API Key** (so Docker can see it):
//     * **Windows PowerShell:** `$env:OPENROUTER_API_KEY="sk-or-v1-..."` (Paste your real key)
//     * **Mac/Linux:** `export OPENROUTER_API_KEY="sk-or-v1-..."`
// 3.  **Run the command:**
//     ```bash
//     docker-compose up --build