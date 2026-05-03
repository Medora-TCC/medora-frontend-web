import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.tsx'

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import("../mock/browser.ts");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
