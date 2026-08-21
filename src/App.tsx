import { AppRouter } from './router/index'
import { ToastProvider } from './hooks/useToast'
import { HelmetProvider } from 'react-helmet-async'
import { ProfileProvider } from './contexts/ProfileContext'

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <ProfileProvider>
          <AppRouter />
        </ProfileProvider>
      </ToastProvider>
    </HelmetProvider>
  )
}
