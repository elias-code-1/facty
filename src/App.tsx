import { AppRouter } from './router/index'
import { ToastProvider } from './hooks/useToast'
import { HelmetProvider } from 'react-helmet-async'

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </HelmetProvider>
  )
}
