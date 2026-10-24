import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.tsx'

async function prepare() {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import("../mock/browser.ts");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
      <App />
  )
})
