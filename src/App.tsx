import { AppRouter } from './router/index'
import { ToastProvider } from './hooks/useToast'
import { HelmetProvider } from 'react-helmet-async'
import ErrorViewer from './components/ui/ErrorViewer'

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AppRouter />
        {import.meta.env.DEV && <ErrorViewer />}
      </ToastProvider>
    </HelmetProvider>
  )
}
