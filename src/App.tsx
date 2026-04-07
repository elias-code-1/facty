import { AppRouter } from './router/index'
import { ToastProvider } from './hooks/useToast'

export default function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  )
}
