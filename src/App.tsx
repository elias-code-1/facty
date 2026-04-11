import { AppRouter } from './router/index'
import { ToastProvider } from './hooks/useToast'
import { HelmetProvider } from 'react-helmet-async'
import ReloadPrompt from './components/ui/ReloadPrompt'
import InstallPWA from './components/ui/InstallPWA'

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AppRouter />
        <ReloadPrompt />
        <InstallPWA />
      </ToastProvider>
    </HelmetProvider>
  )
}
